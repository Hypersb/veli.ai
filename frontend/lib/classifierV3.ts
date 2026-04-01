/**
 * Veil V3 client-side classifier.
 * Mirrors V2 preprocessing and heuristics while adding ONNX inference, adversarial normalization,
 * domain intelligence, and local feedback-based confidence adjustment.
 */

import modelDataRaw from "../public/model.json";
import type { FeatureContributionSummary, HeuristicFlag, Label, PredictionResult, TopFeature } from "./classifier";
import { buildAgentDecision } from "./agent";

const modelData = modelDataRaw as unknown as ModelJson;
const ONNX_MODEL_PATH = "/model.onnx";
const ONNX_CDN = "https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js";
const ONNX_INPUT_SIZE = 3000;
const FEEDBACK_KEY = "veil_feedback_v3";
const FEEDBACK_MAX = 100;

interface ModelJson {
  version: string;
  vocabulary: Record<string, number>;
  idf_values: number[];
  coef: number[];
  intercept: number;
  feature_names: string[];
}

interface OrtTensor {
  data: Float32Array | number[];
  dims: number[];
}

interface OrtInferenceSession {
  run(feeds: Record<string, OrtTensor>): Promise<Record<string, OrtTensor>>;
  inputNames: string[];
}

interface OrtApi {
  InferenceSession: {
    create(path: string, options?: Record<string, unknown>): Promise<OrtInferenceSession>;
  };
  Tensor: new (type: "float32", data: Float32Array, dims: number[]) => OrtTensor;
}

interface FeedbackCorrectionEntry {
  text: string;
  correctedLabel: Label;
  createdAt: string;
}

export interface PredictionResultV3 extends PredictionResult {
  inferenceSource: "onnx" | "api-fallback";
}

let ortScriptPromise: Promise<void> | null = null;
let sessionPromise: Promise<OrtInferenceSession> | null = null;

/** Normalize obfuscated adversarial words before standard cleaning. */
export function normalizeAdversarialText(text: string): string {
  const substitutions: Array<[RegExp, string]> = [
    [/c0ngr@ts/gi, "congrats"],
    [/cl!ck/gi, "click"],
    [/v3rify/gi, "verify"],
    [/pa\$\$word/gi, "password"],
    [/acc0unt/gi, "account"],
  ];

  let normalized = text;
  for (const [pattern, replacement] of substitutions) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized;
}

/** Convert text to V2-compatible canonical format. */
function cleanText(text: string): string {
  let t = text.toLowerCase();
  t = t.replace(/https?:\/\/\S+|www\.\S+/g, "url");
  t = t.replace(/<[^>]+>/g, "");
  t = t.replace(/\d+/g, "num");
  t = t.replace(/[^\w\s]/g, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

/** Build TF-IDF feature vector matching V2/vectorizer schema. */
function tfidfVectorize(text: string): number[] {
  const vocab = modelData.vocabulary;
  const idf = modelData.idf_values;
  const n = idf.length;

  const features = new Array<number>(n).fill(0);
  const words = text.split(" ").filter((w) => w.length > 0);

  const tf: Record<string, number> = {};
  for (const word of words) {
    tf[word] = (tf[word] ?? 0) + 1;
  }

  for (let i = 0; i < words.length - 1; i += 1) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    tf[bigram] = (tf[bigram] ?? 0) + 1;
  }

  for (const [term, count] of Object.entries(tf)) {
    const idx = vocab[term];
    if (typeof idx === "number" && idx >= 0 && idx < n) {
      const termFreq = 1 + Math.log(count);
      features[idx] = termFreq * idf[idx];
    }
  }

  const norm = Math.sqrt(features.reduce((sum, v) => sum + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < features.length; i += 1) {
      features[i] /= norm;
    }
  }

  return features;
}

/** Pad or trim vector to the ONNX model input contract. */
function toOnnxInputVector(features: number[]): Float32Array {
  const input = new Float32Array(ONNX_INPUT_SIZE);
  const copyLength = Math.min(features.length, ONNX_INPUT_SIZE);
  for (let i = 0; i < copyLength; i += 1) {
    input[i] = features[i];
  }
  return input;
}

/** Score potentially risky domains based on TLD and lexical randomness. */
export function detectDomainRisk(urls: string[]): HeuristicFlag[] {
  const suspiciousTlds = [".xyz", ".click", ".top", ".gq", ".work", ".cam"];
  const flags: HeuristicFlag[] = [];

  for (const rawUrl of urls) {
    let hostname = "";
    try {
      const normalized = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
      hostname = new URL(normalized).hostname.toLowerCase();
    } catch {
      continue;
    }

    const tldHit = suspiciousTlds.find((tld) => hostname.endsWith(tld));
    if (tldHit) {
      flags.push({
        rule: "SUSPICIOUS_TLD",
        description: `Domain uses suspicious TLD (${tldHit})`,
        severity: "high",
      });
    }

    const token = hostname.replace(/\./g, "");
    const consonantRuns = token.match(/[bcdfghjklmnpqrstvwxyz]{5,}/gi)?.length ?? 0;
    const digitRatio = token.length > 0 ? (token.match(/\d/g)?.length ?? 0) / token.length : 0;

    if (token.length >= 14 && (consonantRuns > 0 || digitRatio >= 0.2)) {
      flags.push({
        rule: "DOMAIN_RANDOMNESS",
        description: "Domain appears newly formed or algorithmically generated",
        severity: "medium",
      });
    }
  }

  return flags;
}

/** Extract URLs from the original text for returned result details. */
function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+/gi;
  const matches = text.match(urlRegex) ?? [];
  return Array.from(new Set(matches));
}

/** Run V2-compatible heuristic flags plus V3 domain-risk heuristics. */
function runHeuristics(text: string, urls: string[]): HeuristicFlag[] {
  const flags: HeuristicFlag[] = [];
  const lower = text.toLowerCase();

  if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(text)) {
    flags.push({
      rule: "IP_URL",
      description: "Contains IP-based URL (never used by legitimate services)",
      severity: "high",
    });
  }

  const urgencyPhrases = [
    "act now",
    "limited time",
    "expires in",
    "act immediately",
    "urgent",
    "action required",
    "account suspended",
    "verify now",
    "confirm immediately",
    "respond immediately",
    "hours only",
    "24 hours",
    "48 hours",
    "final notice",
    "last chance",
  ];

  const urgencyHits = urgencyPhrases.filter((phrase) => lower.includes(phrase));
  if (urgencyHits.length >= 2) {
    flags.push({
      rule: "URGENCY_LANGUAGE",
      description: `Multiple urgency phrases: ${urgencyHits.slice(0, 2).join(", ")}`,
      severity: "medium",
    });
  }

  const financialKeywords = ["wire transfer", "gift card", "ssn", "cvv", "routing number", "bank account"];
  if (financialKeywords.some((kw) => lower.includes(kw))) {
    flags.push({
      rule: "FINANCIAL_KEYWORDS",
      description: "Financial or credential extraction language detected",
      severity: "high",
    });
  }

  return [...flags, ...detectDomainRisk(urls)];
}

/** Convert heuristic severity counts to a normalized [0,1] score. */
function scoreHeuristics(flags: HeuristicFlag[]): number {
  let score = 0;
  for (const flag of flags) {
    if (flag.severity === "high") score += 1.0;
    if (flag.severity === "medium") score += 0.5;
    if (flag.severity === "low") score += 0.25;
  }
  return Math.max(0, Math.min(1, score / 4));
}

/**
 * Merge model and heuristic confidence.
 * final_score = 0.7 * ml + 0.3 * heuristics
 */
function determineLabel(mlProbability: number, flags: HeuristicFlag[]): { label: Label; finalScore: number } {
  const heuristicScore = scoreHeuristics(flags);
  const finalScore = 0.7 * mlProbability + 0.3 * heuristicScore;

  if (finalScore >= 0.85) return { label: "Phishing", finalScore };
  if (finalScore >= 0.65) return { label: "Spam", finalScore };
  if (finalScore >= 0.45) return { label: "Suspicious", finalScore };
  return { label: "Safe", finalScore };
}

/** Build top token contributions from TF-IDF feature weight x coefficient. */
function getTopFeatures(features: number[]): TopFeature[] {
  const contributions = features.map((value, index) => {
    const contribution = value * modelData.coef[index];
    return {
      word: modelData.feature_names[index] ?? `feature_${index}`,
      contribution,
      magnitude: Math.abs(contribution),
    };
  });

  contributions.sort((a, b) => b.magnitude - a.magnitude);

  return contributions
    .filter((entry) => entry.magnitude > 0)
    .slice(0, 15)
    .map((entry) => ({
      word: entry.word,
      weight: entry.magnitude,
      direction: entry.contribution >= 0 ? "spam" : "safe",
    }));
}

/** Load onnxruntime-web script lazily so existing V2 bundles remain unchanged. */
async function ensureOrtLoaded(): Promise<OrtApi> {
  const maybeOrt = (globalThis as { ort?: OrtApi }).ort;
  if (maybeOrt) return maybeOrt;

  if (!ortScriptPromise) {
    ortScriptPromise = new Promise<void>((resolve, reject) => {
      if (typeof document === "undefined") {
        reject(new Error("ONNX runtime requires browser context (document unavailable)."));
        return;
      }

      const existing = document.querySelector(`script[data-veil-ort=\"1\"]`) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load existing ONNX runtime script.")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = ONNX_CDN;
      script.async = true;
      script.dataset.veilOrt = "1";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Unable to download onnxruntime-web from CDN."));
      document.head.appendChild(script);
    });
  }

  await ortScriptPromise;
  const loadedOrt = (globalThis as { ort?: OrtApi }).ort;
  if (!loadedOrt) {
    throw new Error("ONNX runtime script loaded but global ort object is missing.");
  }
  return loadedOrt;
}

/** Create and cache ONNX inference session for repeated low-latency scans. */
async function getSession(): Promise<OrtInferenceSession> {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const ort = await ensureOrtLoaded();
      try {
        return await ort.InferenceSession.create(ONNX_MODEL_PATH, {
          executionProviders: ["wasm"],
          graphOptimizationLevel: "all",
        });
      } catch (error) {
        throw new Error(`Failed to initialize ONNX model session: ${String(error)}`);
      }
    })();
  }
  return sessionPromise;
}

/** Extract spam probability from ONNX outputs without relying on fragile output names. */
function extractProbability(outputs: Record<string, OrtTensor>): number {
  const entries = Object.values(outputs);
  if (entries.length === 0) {
    throw new Error("ONNX output tensor map is empty.");
  }

  for (const tensor of entries) {
    const values = Array.from(tensor.data);
    if (values.length === 2) {
      const candidate = Number(values[1]);
      if (Number.isFinite(candidate)) {
        return Math.max(0, Math.min(1, candidate));
      }
    }
  }

  for (const tensor of entries) {
    const values = Array.from(tensor.data);
    if (values.length >= 1) {
      const candidate = Number(values[0]);
      if (Number.isFinite(candidate)) {
        return Math.max(0, Math.min(1, candidate));
      }
    }
  }

  throw new Error("Unable to parse spam probability from ONNX outputs.");
}

/** Persist user correction feedback locally with a hard max-size cap. */
export function saveFeedbackCorrection(text: string, correctedLabel: Label): void {
  if (typeof window === "undefined") return;

  const cleaned = cleanText(normalizeAdversarialText(text));
  if (!cleaned) return;

  const nextEntry: FeedbackCorrectionEntry = {
    text: cleaned,
    correctedLabel,
    createdAt: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    const existing = raw ? (JSON.parse(raw) as FeedbackCorrectionEntry[]) : [];
    const updated = [nextEntry, ...existing].slice(0, FEEDBACK_MAX);
    localStorage.setItem(FEEDBACK_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save V3 feedback correction:", error);
  }
}

/** Compute confidence nudges from locally stored corrections for similar text. */
export function getFeedbackAdjustments(cleanedText: string): number {
  if (typeof window === "undefined") return 0;

  try {
    const raw = localStorage.getItem(FEEDBACK_KEY);
    if (!raw) return 0;

    const entries = JSON.parse(raw) as FeedbackCorrectionEntry[];
    if (!Array.isArray(entries) || entries.length === 0) return 0;

    const currentTokens = new Set(cleanedText.split(" ").filter((token) => token.length > 2));
    if (currentTokens.size === 0) return 0;

    let adjustment = 0;
    for (const entry of entries) {
      const feedbackTokens = new Set(entry.text.split(" ").filter((token) => token.length > 2));
      const overlapCount = Array.from(currentTokens).filter((token) => feedbackTokens.has(token)).length;
      const overlapRatio = overlapCount / Math.max(currentTokens.size, 1);

      if (overlapRatio >= 0.45) {
        if (entry.correctedLabel === "Safe") adjustment -= 0.04;
        if (entry.correctedLabel === "Suspicious") adjustment += 0.02;
        if (entry.correctedLabel === "Spam") adjustment += 0.04;
        if (entry.correctedLabel === "Phishing") adjustment += 0.06;
      }
    }

    return Math.max(-0.1, Math.min(0.1, adjustment));
  } catch (error) {
    console.error("Failed to compute feedback adjustments:", error);
    return 0;
  }
}

/** Fallback to existing V2 API route when local ONNX path is unavailable. */
async function fallbackToApi(rawText: string, startedAt: number): Promise<PredictionResultV3> {
  const response = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: rawText }),
  });

  if (!response.ok) {
    throw new Error(`Fallback API failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as {
    label: Label;
    confidence: number;
    probability: { safe: number; spam: number };
    topFeatures: TopFeature[];
    heuristicFlags: HeuristicFlag[];
    urlsFound?: string[];
    processingTimeMs?: number;
    modelVersion?: string;
    action?: "allow" | "warn" | "flag" | "block";
    explanation?: string;
    contributions?: FeatureContributionSummary;
  };

  return {
    label: payload.label,
    confidence: payload.confidence,
    probability: payload.probability,
    topFeatures: payload.topFeatures,
    heuristicFlags: payload.heuristicFlags,
    urlsFound: [],
    processingTimeMs: payload.processingTimeMs ?? Date.now() - startedAt,
    modelVersion: payload.modelVersion ?? "2.0.0",
    action: payload.action ?? (payload.label === "Safe" ? "allow" : payload.label === "Suspicious" ? "warn" : payload.label === "Spam" ? "flag" : "block"),
    explanation: payload.explanation ?? "Fallback response from existing V2 API.",
    contributions: payload.contributions ?? {
      topPositiveTokens: [],
      topNegativeTokens: [],
      mlContribution: 0,
      heuristicContribution: 0,
    },
    inferenceSource: "api-fallback",
  };
}

/** Run full V3 inference pipeline locally, with safe fallback to V2 API. */
export async function classifyV3(rawText: string): Promise<PredictionResultV3> {
  const startedAt = Date.now();

  try {
    if (!rawText || rawText.trim().length < 1) {
      throw new Error("Input text is empty; cannot classify.");
    }

    const normalizedText = normalizeAdversarialText(rawText);
    const cleanedText = cleanText(normalizedText);
    const featureVector = tfidfVectorize(cleanedText);

    const urls = extractUrls(rawText);
    const heuristicFlags = runHeuristics(rawText, urls);

    const session = await getSession();
    const ort = await ensureOrtLoaded();

    const inputName = session.inputNames[0];
    if (!inputName) {
      throw new Error("ONNX model does not expose an input name.");
    }

    const onnxInput = toOnnxInputVector(featureVector);
    const tensor = new ort.Tensor("float32", onnxInput, [1, ONNX_INPUT_SIZE]);
    const outputs = await session.run({ [inputName]: tensor });

    let spamProbability = extractProbability(outputs);

    // Apply local user-correction adjustments after model inference to keep base model untouched.
    const feedbackAdjustment = getFeedbackAdjustments(cleanedText);
    spamProbability = Math.max(0, Math.min(1, spamProbability + feedbackAdjustment));

    const { label, finalScore } = determineLabel(spamProbability, heuristicFlags);
    const safeProbability = 1 - spamProbability;
    const topFeatures = getTopFeatures(featureVector);
    const heuristicScore = scoreHeuristics(heuristicFlags);
    const decision = buildAgentDecision(
      label,
      spamProbability,
      heuristicScore,
      featureVector,
      modelData.coef,
      modelData.feature_names,
      heuristicFlags
    );

    return {
      label,
      confidence: Math.round(Math.max(finalScore, 1 - finalScore) * 100),
      probability: {
        safe: Math.round(safeProbability * 1000) / 10,
        spam: Math.round(spamProbability * 1000) / 10,
      },
      topFeatures,
      heuristicFlags,
      urlsFound: urls,
      processingTimeMs: Date.now() - startedAt,
      modelVersion: `${modelData.version}-v3` ,
      inferenceSource: "onnx",
      action: decision.action,
      explanation: decision.explanation,
      contributions: decision.contributions,
    };
  } catch (error) {
    console.error("V3 local inference failed, using API fallback:", error);
    return fallbackToApi(rawText, startedAt);
  }
}

// Shared local inference engine for Veil V3 Chrome extension.

(function () {
  const MODEL_URL = chrome.runtime.getURL("model.onnx");
  const MODEL_JSON_URL = chrome.runtime.getURL("model.json");
  const ONNX_INPUT_SIZE = 3000;

  let modelJson = null;
  let sessionPromise = null;

  // Normalize common adversarial obfuscations before feature extraction.
  function normalizeAdversarialText(text) {
    return String(text)
      .replace(/c0ngr@ts/gi, "congrats")
      .replace(/cl!ck/gi, "click")
      .replace(/acc0unt/gi, "account")
      .replace(/v3rify/gi, "verify");
  }

  // Match V2 cleaning pipeline so vectorization stays compatible with stored coefficients.
  function cleanText(text) {
    return text
      .toLowerCase()
      .replace(/https?:\/\/\S+|www\.\S+/g, "url")
      .replace(/<[^>]+>/g, "")
      .replace(/\d+/g, "num")
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Extract URL entities for domain risk heuristics.
  function extractUrls(text) {
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+/gi;
    const matches = String(text).match(urlRegex) || [];
    return Array.from(new Set(matches));
  }

  // Flag suspicious top-level domains and random-looking hostnames.
  function detectDomainRisk(urls) {
    const suspiciousTlds = [".xyz", ".click", ".top", ".gq", ".work"];
    const flags = [];

    for (const raw of urls) {
      try {
        const parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
        const hostname = parsed.hostname.toLowerCase();

        const hit = suspiciousTlds.find((tld) => hostname.endsWith(tld));
        if (hit) {
          flags.push({
            rule: "SUSPICIOUS_TLD",
            description: `Suspicious domain suffix detected (${hit})`,
            severity: "high",
          });
        }

        const token = hostname.replace(/\./g, "");
        const digitRatio = token.length ? (token.match(/\d/g) || []).length / token.length : 0;
        if (token.length >= 14 && digitRatio >= 0.2) {
          flags.push({
            rule: "DOMAIN_RANDOMNESS",
            description: "Domain appears newly formed or randomly generated",
            severity: "medium",
          });
        }
      } catch (_error) {
        // Ignore malformed URLs extracted from dynamic Gmail text nodes.
      }
    }

    return flags;
  }

  // Produce deterministic agent action from final label.
  function determineAction(label) {
    if (label === "Safe") return "allow";
    if (label === "Suspicious") return "warn";
    if (label === "Spam") return "flag";
    return "block";
  }

  // Compute weighted merge of model confidence and heuristic severity.
  function mergeScores(ml, heuristicScore) {
    const boundedMl = Math.max(0, Math.min(1, ml));
    const boundedHeuristic = Math.max(0, Math.min(1, heuristicScore));
    return 0.7 * boundedMl + 0.3 * boundedHeuristic;
  }

  // Convert raw score to Veil security taxonomy.
  function scoreToLabel(score) {
    if (score >= 0.85) return "Phishing";
    if (score >= 0.65) return "Spam";
    if (score >= 0.45) return "Suspicious";
    return "Safe";
  }

  // Build token vector with TF-IDF values from packaged model.json.
  function tfidfVectorize(cleanedText) {
    if (!modelJson) {
      throw new Error("Model JSON has not been loaded.");
    }

    const vocab = modelJson.vocabulary;
    const idf = modelJson.idf_values;
    const n = idf.length;
    const features = new Array(n).fill(0);

    const words = cleanedText.split(" ").filter(Boolean);
    const tf = {};

    for (const word of words) tf[word] = (tf[word] || 0) + 1;
    for (let i = 0; i < words.length - 1; i += 1) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      tf[bigram] = (tf[bigram] || 0) + 1;
    }

    for (const [term, count] of Object.entries(tf)) {
      const index = vocab[term];
      if (typeof index === "number" && index >= 0 && index < n) {
        features[index] = (1 + Math.log(count)) * idf[index];
      }
    }

    const norm = Math.sqrt(features.reduce((sum, value) => sum + value * value, 0));
    if (norm > 0) {
      for (let i = 0; i < features.length; i += 1) {
        features[i] /= norm;
      }
    }

    return features;
  }

  // Pad or trim vectors to ONNX model input size.
  function toOnnxInputVector(features) {
    const input = new Float32Array(ONNX_INPUT_SIZE);
    const copyLength = Math.min(features.length, ONNX_INPUT_SIZE);
    for (let i = 0; i < copyLength; i += 1) {
      input[i] = features[i];
    }
    return input;
  }

  // Compute local logistic probability when ONNX runtime is unavailable.
  function logisticProbability(features, coefficients, intercept) {
    const length = Math.min(features.length, coefficients.length);
    let logit = Number(intercept || 0);
    for (let i = 0; i < length; i += 1) {
      logit += Number(coefficients[i] || 0) * Number(features[i] || 0);
    }
    return 1 / (1 + Math.exp(-logit));
  }

  // Derive explainability payload aligned with heatmap token contribution method.
  function getFeatureContributions(vector, coefficients, featureNames, heuristicScore) {
    const ranked = vector.map((value, index) => {
      const contribution = value * coefficients[index];
      return {
        token: featureNames[index] || `feature_${index}`,
        value: contribution,
        magnitude: Math.abs(contribution),
      };
    });

    ranked.sort((a, b) => b.magnitude - a.magnitude);

    const topPositiveTokens = ranked.filter((item) => item.value > 0).slice(0, 12).map((item) => item.token);
    const topNegativeTokens = ranked.filter((item) => item.value < 0).slice(0, 12).map((item) => item.token);

    const mlContributionRaw = ranked.reduce((sum, item) => sum + item.value, 0);
    const mlContribution = Math.max(0, Math.min(1, (mlContributionRaw + 2) / 4));

    return {
      topPositiveTokens,
      topNegativeTokens,
      mlContribution,
      heuristicContribution: Math.max(0, Math.min(1, heuristicScore)),
    };
  }

  // Load local model JSON package required for feature reconstruction.
  async function ensureModelJson() {
    if (modelJson) return modelJson;

    const res = await fetch(MODEL_JSON_URL);
    if (!res.ok) {
      throw new Error(`Unable to load local model.json (status ${res.status}).`);
    }

    modelJson = await res.json();
    return modelJson;
  }

  // Create ONNX inference session from packaged model if runtime is available.
  async function ensureSession() {
    if (sessionPromise) return sessionPromise;

    sessionPromise = (async () => {
      if (!window.ort || !window.ort.InferenceSession) {
        throw new Error("onnxruntime-web is not available in extension context.");
      }
      return window.ort.InferenceSession.create(MODEL_URL, {
        executionProviders: ["wasm"],
      });
    })();

    return sessionPromise;
  }

  // Parse probability tensor robustly across sklearn-onnx output naming patterns.
  function extractSpamProbability(outputs) {
    const tensors = Object.values(outputs || {});
    for (const tensor of tensors) {
      const values = Array.from(tensor.data || []);
      if (values.length === 2) {
        return Math.max(0, Math.min(1, Number(values[1])));
      }
    }
    for (const tensor of tensors) {
      const values = Array.from(tensor.data || []);
      if (values.length > 0) {
        return Math.max(0, Math.min(1, Number(values[0])));
      }
    }
    throw new Error("Unable to parse probability from ONNX output tensors.");
  }

  // Run full local pipeline and return classifier + agent + explainability payload.
  async function run(text) {
    const startedAt = Date.now();

    if (!text || String(text).trim().length < 1) {
      throw new Error("Email text is empty; cannot run Veil inference.");
    }

    await ensureModelJson();

    const normalized = normalizeAdversarialText(text);
    const cleaned = cleanText(normalized);
    const urls = extractUrls(text);
    const heuristicFlags = detectDomainRisk(urls);

    let mlProbability = 0.5;
    let onnxError = null;

    try {
      const featureVector = tfidfVectorize(cleaned);
      const session = await ensureSession();
      const inputName = session.inputNames && session.inputNames[0];
      if (!inputName) {
        throw new Error("ONNX session did not expose an input tensor name.");
      }

      const onnxInput = toOnnxInputVector(featureVector);
      const tensor = new window.ort.Tensor("float32", onnxInput, [1, ONNX_INPUT_SIZE]);
      const outputs = await session.run({ [inputName]: tensor });
      mlProbability = extractSpamProbability(outputs);
    } catch (error) {
      onnxError = error;
      const vector = tfidfVectorize(cleaned);
      mlProbability = logisticProbability(vector, modelJson.coef || [], modelJson.intercept || 0);
      console.error("Veil ONNX path failed; continuing with local logistic fallback.", error);
    }

    const heuristicScore = Math.max(0, Math.min(1, heuristicFlags.length / 3));
    const finalScore = mergeScores(mlProbability, heuristicScore);
    const label = scoreToLabel(finalScore);
    const action = determineAction(label);

    const vector = tfidfVectorize(cleaned);
    const contributions = getFeatureContributions(
      vector,
      modelJson.coef || [],
      modelJson.feature_names || [],
      heuristicScore
    );

    const explanation =
      `Action ${action.toUpperCase()} from merged threat score ${finalScore.toFixed(3)} ` +
      `(ml=${mlProbability.toFixed(3)}, heuristics=${heuristicScore.toFixed(3)}).` +
      (onnxError ? " ONNX unavailable, heuristic blend applied." : " ONNX local inference succeeded.");

    return {
      label,
      action,
      confidence: Math.round(Math.max(finalScore, 1 - finalScore) * 100),
      probability: {
        safe: Math.round((1 - mlProbability) * 1000) / 10,
        spam: Math.round(mlProbability * 1000) / 10,
      },
      explanation,
      contributions,
      heuristicFlags,
      processingTimeMs: Date.now() - startedAt,
    };
  }

  window.VeilInference = {
    run,
  };
})();

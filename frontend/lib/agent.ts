/**
 * Veil V3 agent layer for autonomous actioning and explainability.
 */

import type { HeuristicFlag, Label } from "./classifier";

export type AgentAction = "allow" | "warn" | "flag" | "block";

export interface FeatureContributionSummary {
  topPositiveTokens: string[];
  topNegativeTokens: string[];
  mlContribution: number;
  heuristicContribution: number;
}

export interface AgentDecision {
  label: Label;
  action: AgentAction;
  explanation: string;
  contributions: FeatureContributionSummary;
}

/** Map a predicted threat label into a deterministic security action. */
export function determineAction(label: Label): AgentAction {
  if (label === "Safe") return "allow";
  if (label === "Suspicious") return "warn";
  if (label === "Spam") return "flag";
  return "block";
}

/** Blend ML and heuristic scores with V3 weighted confidence merge. */
export function mergeScores(mlScore: number, heuristicScore: number): number {
  const boundedMl = Math.max(0, Math.min(1, mlScore));
  const boundedHeuristic = Math.max(0, Math.min(1, heuristicScore));

  // Weighted merge keeps model probability primary while retaining deterministic rule safeguards.
  return 0.7 * boundedMl + 0.3 * boundedHeuristic;
}

/** Build explainability payload from token vectors and per-feature model coefficients. */
export function getFeatureContributions(
  vector: number[],
  coefficients: number[],
  featureNames: string[],
  heuristicFlags: HeuristicFlag[]
): FeatureContributionSummary {
  const length = Math.min(vector.length, coefficients.length, featureNames.length);
  const scored: Array<{ token: string; value: number }> = [];

  let mlRaw = 0;
  for (let i = 0; i < length; i += 1) {
    const contribution = vector[i] * coefficients[i];
    mlRaw += contribution;
    scored.push({ token: featureNames[i], value: contribution });
  }

  scored.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  const topPositiveTokens = scored
    .filter((entry) => entry.value > 0)
    .slice(0, 12)
    .map((entry) => entry.token);

  const topNegativeTokens = scored
    .filter((entry) => entry.value < 0)
    .slice(0, 12)
    .map((entry) => entry.token);

  const heuristicWeight = heuristicFlags.reduce((sum, flag) => {
    if (flag.severity === "high") return sum + 1;
    if (flag.severity === "medium") return sum + 0.5;
    return sum + 0.25;
  }, 0);

  const heuristicContribution = Math.max(0, Math.min(1, heuristicWeight / 4));
  const mlContribution = Math.max(0, Math.min(1, (mlRaw + 2) / 4));

  return {
    topPositiveTokens,
    topNegativeTokens,
    mlContribution,
    heuristicContribution,
  };
}

/** Create final V3 agent decision object containing action and explanation details. */
export function buildAgentDecision(
  label: Label,
  mlScore: number,
  heuristicScore: number,
  vector: number[],
  coefficients: number[],
  featureNames: string[],
  heuristicFlags: HeuristicFlag[]
): AgentDecision {
  const action = determineAction(label);
  const merged = mergeScores(mlScore, heuristicScore);
  const contributions = getFeatureContributions(vector, coefficients, featureNames, heuristicFlags);

  const explanation =
    `Decision ${action.toUpperCase()} because label=${label}, ` +
    `merged_score=${merged.toFixed(3)}, ml=${contributions.mlContribution.toFixed(3)}, ` +
    `heuristics=${contributions.heuristicContribution.toFixed(3)}, flags=${heuristicFlags.length}.`;

  return {
    label,
    action,
    explanation,
    contributions,
  };
}

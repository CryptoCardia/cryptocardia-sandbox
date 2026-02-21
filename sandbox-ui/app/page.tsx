"use client";

import { useState, useEffect } from "react";

const API = process.env.NEXT_PUBLIC_SANDBOX_API;

export default function Home() {
  const [result, setResult] = useState<any>(null);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [intentAmount, setIntentAmount] = useState(250000);

  const [scenario, setScenario] = useState({
    new_recipient: true,
    high_velocity: true,
    replay_attempt: false,
    contract_param_tamper: false,
  });

  const [executionJson, setExecutionJson] = useState(
    JSON.stringify(
      {
        contract_type: "ESCROW",
        method: "release",
        params: {
          recipient: "0xabc",
          amountUsd: 250000,
        },
      },
      null,
      2
    )
  );

  async function runSimulation() {
    if (!API) {
      alert("NEXT_PUBLIC_SANDBOX_API not set");
      return;
    }

    setLoading(true);

    const execution = JSON.parse(executionJson);

    const res = await fetch(`${API}/lab/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        intent: { amountUsd: intentAmount },
        scenario,
        execution,
      }),
    });

    const data = await res.json();
    setResult(data);
    await loadDashboard();
    setLoading(false);
  }

  async function loadDashboard() {
    if (!API) return;

    const res = await fetch(`${API}/lab/dashboard`);
    const data = await res.json();
    setDashboard(data);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <main className="min-h-screen bg-[#0B0F14] text-white font-mono p-8">

      {/* Top Bar */}
      <div className="mb-10 border-b border-[#1F2933] pb-4">
        <h1 className="text-3xl text-[#00FF9C]">
          CRYPTOCARDIA // EXECUTION GOVERNANCE LAB
        </h1>
        <p className="text-sm text-[#8A9BA8] mt-2">
          Mode: SANDBOX | Policy: DEFAULT_V1 | API: LIVE
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">

        {/* Attack Surface */}
        <div className="bg-[#11161D] p-6 border border-[#1F2933]">
          <h2 className="text-xl text-[#00FF9C] mb-6">
            Attack Surface
          </h2>

          <label className="block mb-2">Intent Amount (USD)</label>
          <input
            type="number"
            value={intentAmount}
            onChange={(e) => setIntentAmount(Number(e.target.value))}
            className="bg-black border border-[#1F2933] p-2 w-full mb-6"
          />

          <h3 className="mb-3 text-[#8A9BA8]">Scenario Toggles</h3>

          <div className="space-y-2">
            {Object.keys(scenario).map((key) => (
              <label key={key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={(scenario as any)[key]}
                  onChange={(e) =>
                    setScenario({
                      ...scenario,
                      [key]: e.target.checked,
                    })
                  }
                />
                <span>{key}</span>
              </label>
            ))}
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="mt-6 bg-[#00FF9C] text-black px-6 py-3 font-bold"
          >
            {loading ? "Running..." : "EXECUTE"}
          </button>
        </div>

        {/* Execution Payload */}
        <div className="bg-[#11161D] p-6 border border-[#1F2933]">
          <h2 className="text-xl text-[#00FF9C] mb-6">
            Execution Payload
          </h2>

          <textarea
            value={executionJson}
            onChange={(e) => setExecutionJson(e.target.value)}
            className="w-full h-80 bg-black border border-[#1F2933] p-4 text-sm"
          />
        </div>
      </div>

      {/* Decision Panel */}
      {result && (
        <div className="mt-10 grid grid-cols-2 gap-8">

          <div className="bg-[#11161D] p-6 border border-[#1F2933]">
            <h2 className="text-xl text-[#00FF9C] mb-4">
              Governance Decision
            </h2>

            <p>
              <strong>Baseline:</strong>{" "}
              {result.baseline.decision}
            </p>

            <p className="mt-2">
              <strong>Governed:</strong>{" "}
              <span
                className={
                  result.governed.decision === "DENY"
                    ? "text-red-500"
                    : result.governed.decision === "STEP_UP"
                    ? "text-yellow-400"
                    : "text-green-400"
                }
              >
                {result.governed.decision}
              </span>
            </p>

            <p className="mt-2">
              <strong>Risk:</strong> {result.governed.risk}
            </p>

            <p className="mt-2">
              <strong>Reasons:</strong>{" "}
              {result.governed.reasons?.join(", ")}
            </p>

            <div className="mt-6 text-xs text-[#8A9BA8]">
              <p>
                Expected Hash: {result.execution.expectedExecHash}
              </p>
              <p>
                Actual Hash: {result.execution.actualExecHash}
              </p>
            </div>
          </div>

          <div className="bg-[#11161D] p-6 border border-[#1F2933]">
            <h2 className="text-xl text-[#00FF9C] mb-4">
              Economic Impact
            </h2>

            <p>
              Attempted: ${result.economics.attemptedValue}
            </p>

            <p>
              Prevented: ${result.economics.preventedLoss}
            </p>

            <p>
              Friction: ${result.economics.frictionCost}
            </p>

            <p className="mt-4 font-bold text-[#00FF9C]">
              Net Security Value: $
              {result.economics.netSecurityValue}
            </p>
          </div>
        </div>
      )}

      {/* Dashboard */}
      {dashboard && (
        <div className="mt-10 bg-[#11161D] p-6 border border-[#1F2933]">
          <h2 className="text-xl text-[#00FF9C] mb-4">
            Cumulative Ledger
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <p>Total Runs: {dashboard.total_runs}</p>
            <p>Total Attempted: ${dashboard.total_attempted}</p>
            <p>Total Prevented: ${dashboard.total_prevented}</p>
            <p>Total Friction: ${dashboard.total_friction}</p>
            <p className="font-bold text-[#00FF9C]">
              Net Security Value: ${dashboard.net_security_value}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
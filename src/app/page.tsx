'use client'
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { Scale, Sparkles } from 'lucide-react';
import { sdk } from "@farcaster/miniapp-sdk";
import { useAddMiniApp } from "@/hooks/useAddMiniApp";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";

export default function LawCodexPlayground() {
    const { addMiniApp } = useAddMiniApp();
    const isInFarcaster = useIsInFarcaster()
    useQuickAuth(isInFarcaster)
    
    useEffect(() => {
      const tryAddMiniApp = async () => {
        try {
          await addMiniApp()
        } catch (error) {
          console.error('Failed to add mini app:', error)
        }
      }
      tryAddMiniApp()
    }, [addMiniApp])

    useEffect(() => {
      const initializeFarcaster = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100))
          await sdk.actions.ready()
          console.log('Farcaster SDK initialized successfully')
        } catch (error) {
          console.error('Failed to initialize Farcaster SDK:', error)
        }
      }
      initializeFarcaster()
    }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900">
      <Toaster position="top-center" richColors />

      {/* Hero Header */}
      <div className="border-b border-emerald-200 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-6xl font-bold text-white mb-4">
                LawCodex Playground
              </h1>
              <p className="text-xl text-emerald-200">
                Governance Rules & Legal Framework Management
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg bg-white/10 p-4 backdrop-blur">
            <div className="text-center">
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-emerald-100">Active Rules</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-emerald-100">Governance Proposals</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">95%</p>
              <p className="text-xs text-emerald-100">Compliance Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white/50 p-8 text-center backdrop-blur">
          <Sparkles className="mx-auto mb-3 h-8 w-8 text-emerald-600" />
          <h3 className="mb-2 text-lg font-bold text-gray-900">
            ⚖️ Legal Framework Laboratory
          </h3>
          <p className="text-sm text-gray-600">
            Create and manage governance rules, track compliance, and oversee legal framework implementation
          </p>
          <div className="mt-6">
            <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold">
              🚀 Start Governance Process
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

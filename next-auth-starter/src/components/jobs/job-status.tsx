"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "@clerk/nextjs"

interface JobStatusProps {
  userId: string
}

type JobStatusValue = "idle" | "pending" | "processing" | "completed" | "failed"

export function JobStatus({ userId }: JobStatusProps) {
  const { isSignedIn } = useAuth()
  const [sessionId, setSessionId] = useState<string>("")
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<JobStatusValue>("idle")
  const [message, setMessage] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null)

  // Stable per-tab session id
  useEffect(() => {
    let sid = sessionStorage.getItem("job_session_id")
    if (!sid) {
      sid = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`)
      sessionStorage.setItem("job_session_id", sid)
    }
    setSessionId(sid)
  }, [])

  // Connect to SSE stream
  useEffect(() => {
    if (!sessionId || !isSignedIn) return

    let closedByClient = false
    const connect = () => {
      try {
        setConnecting(true)
        const url = `/api/jobs/status-stream?session_id=${encodeURIComponent(sessionId)}`
        const eventSource = new EventSource(url)
        eventSourceRef.current = eventSource

        eventSource.onopen = () => {
          setConnecting(false)
        }

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            if (data?.type === "job_status_update") {
              // Only handle updates for this tab's session
              if (data.session_id && data.session_id !== sessionId) return
              setJobId((prev) => prev ?? data.job_id)
              const newStatus = String(data.status || "").toLowerCase() as JobStatusValue
              if (["pending", "processing", "completed", "failed"].includes(newStatus)) {
                setStatus(newStatus)
                setMessage(data.message ?? null)
                setButtonDisabled(newStatus === "pending" || newStatus === "processing")
              }
            } else if (data?.type === "connection") {
              console.log('[JobStatus] SSE connection status:', data.status)
            } else if (data?.type === "error") {
              console.error('[JobStatus] SSE error:', data.message)
            }
            // Ignore heartbeat messages
          } catch (error) {
            console.error('[JobStatus] Error parsing SSE message:', error)
          }
        }

        eventSource.onerror = () => {
          eventSourceRef.current = null
          setConnecting(false)
          
          if (!closedByClient) {
            // Attempt reconnect with backoff
            if (!reconnectTimer.current) {
              reconnectTimer.current = setTimeout(() => {
                reconnectTimer.current = null
                connect()
              }, 1500)
            }
          }
        }
      } catch (error) {
        console.error('[JobStatus] Error connecting to SSE:', error)
        setConnecting(false)
      }
    }

    connect()
    return () => {
      closedByClient = true
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
        reconnectTimer.current = null
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [sessionId, isSignedIn])

  const triggerJob = async () => {
    if (!isSignedIn) {
      alert("Please sign in first")
      return
    }
    try {
      setButtonDisabled(true)
      setStatus("pending")
      setMessage("Submitting job...")

      const payload = {
        session_id: sessionId,
        job_type: "text_generation",
        input_data: {
          prompt: "Test generation from Dashboard",
          max_tokens: 60,
        },
      }

      const res = await fetch('/api/jobs/trigger', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (res.status === 409) {
        // Active job exists for this session
        if (data?.data?.existing_job_id) {
          setJobId(data.data.existing_job_id)
          setStatus("processing")
          setMessage("Resuming active job...")
          setButtonDisabled(true)
          return
        }
      }

      if (!res.ok) {
        setStatus("failed")
        setMessage(data?.message || data?.error || "Failed to create job")
        setButtonDisabled(false)
        return
      }

      if (!data?.success || !data?.data) {
        setStatus("failed")
        setMessage("Invalid server response")
        setButtonDisabled(false)
        return
      }

      setJobId(data.data.id)
      setStatus((String(data.data.status || "pending").toLowerCase() as JobStatusValue) || "pending")
      setMessage(null)
      setButtonDisabled(true)
    } catch (error) {
      console.error(error)
      setStatus("failed")
      setMessage("Network error")
      setButtonDisabled(false)
    }
  }

  const resetState = () => {
    setJobId(null)
    setStatus("idle")
    setMessage(null)
    setButtonDisabled(false)
  }

  const statusBadgeClass = (() => {
    switch (status) {
      case "completed":
        return "bg-success-50 text-success-700 dark:bg-success-900 dark:text-success-300"
      case "failed":
        return "bg-error-50 text-error-700 dark:bg-error-900 dark:text-error-300"
      case "processing":
        return "bg-warning-50 text-warning-700 dark:bg-warning-900 dark:text-warning-300"
      case "pending":
        return "bg-secondary-50 text-secondary-700 dark:bg-secondary-900 dark:text-secondary-300"
      default:
        return "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
    }
  })()

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 shadow-sm">
      <h3 className="text-lg font-medium font-display text-primary-900 dark:text-primary-100 mb-4">Test Generation Status</h3>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadgeClass}`}>
            {status}
          </span>
          {connecting && <span className="text-xs text-secondary-500">(connecting...)</span>}
        </div>
        <div className="text-xs text-secondary-500">session: {sessionId.slice(0, 8)}…</div>
      </div>

      {jobId && (
        <div className="text-xs text-secondary-600 dark:text-secondary-400 mb-2">
          Job ID: <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-700">{jobId}</code>
        </div>
      )}

      {message && (
        <div className="text-sm text-secondary-700 dark:text-secondary-300 mb-3">{message}</div>
      )}

      <div className="flex gap-3">
        <button
          onClick={triggerJob}
          disabled={buttonDisabled}
          className={`px-6 py-3 rounded-md font-medium text-white shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-offset-2 ${
            buttonDisabled
              ? "bg-secondary-400 cursor-not-allowed"
              : "bg-cta-500 hover:bg-cta-600 focus:ring-cta-500"
          }`}
        >
          {buttonDisabled ? "Running…" : "Start Test Generation"}
        </button>
        {(status === "completed" || status === "failed") && (
          <button
            onClick={resetState}
            className="px-4 py-3 rounded-md font-medium bg-neutral-200 dark:bg-neutral-700 text-primary-900 dark:text-primary-100"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

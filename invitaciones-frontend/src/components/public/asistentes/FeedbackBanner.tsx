export interface Feedback {
  tone: 'success' | 'error'
  message: string
}

export function FeedbackBanner({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null

  const isError = feedback.tone === 'error'

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        isError
          ? 'rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600'
          : 'rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700'
      }
    >
      {feedback.message}
    </div>
  )
}

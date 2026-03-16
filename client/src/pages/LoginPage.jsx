// import { useState } from 'react'
// import {
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
// } from 'firebase/auth'
// import { auth } from '../config/firebase'
// import toast from 'react-hot-toast'

// export default function LoginPage() {
//   const [isSignup, setIsSignup] = useState(false)
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     try {
//       if (isSignup) {
//         await createUserWithEmailAndPassword(auth, email, password)
//         toast.success('Account created!')
//       } else {
//         await signInWithEmailAndPassword(auth, email, password)
//         toast.success('Welcome back!')
//       }
//     } catch (err) {
//       toast.error(err.message.replace('Firebase: ', ''))
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen bg-paper flex items-center justify-center px-4">
//       <div className="w-full max-w-md animate-fade-up">
//         <div className="text-center mb-10">
//           <h1 className="font-display text-5xl font-bold text-ink mb-2">Shabdha</h1>
//           <p className="font-body text-muted text-sm tracking-wide">
//             your personal language dictionary
//           </p>
//         </div>

//         <div className="card p-8">
//           <h2 className="font-display text-2xl font-semibold text-ink mb-6">
//             {isSignup ? 'Create account' : 'Welcome back'}
//           </h2>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block font-body text-sm font-medium text-ink/70 mb-1.5">Email</label>
//               <input
//                 type="email"
//                 className="input"
//                 placeholder="you@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>

//             <div>
//               <label className="block font-body text-sm font-medium text-ink/70 mb-1.5">Password</label>
//               <input
//                 type="password"
//                 className="input"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>

//             <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
//               {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
//             </button>
//           </form>

//           <p className="font-body text-sm text-center text-muted mt-6">
//             {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
//             <button
//               onClick={() => setIsSignup(!isSignup)}
//               className="text-accent font-medium hover:underline"
//             >
//               {isSignup ? 'Sign in' : 'Sign up'}
//             </button>
//           </p>
//         </div>

//         <p className="text-center font-body text-xs text-muted mt-6">
//           शब्द — the word that starts the journey
//         </p>
//       </div>
//     </div>
//   )
// }


import { useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { auth } from '../config/firebase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Enter your email first')
      return
    }
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Password reset email sent! Check your inbox.')
      setIsForgotPassword(false)
    } catch (err) {
      toast.error(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      toast.success('Signed in with Google!')
    } catch (err) {
      toast.error(err.message.replace('Firebase: ', ''))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password)
        toast.success('Account created!')
      } else {
        await signInWithEmailAndPassword(auth, email, password)
        toast.success('Welcome back!')
      }
    } catch (err) {
      toast.error(err.message.replace('Firebase: ', ''))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-up">
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl font-bold text-ink mb-2">Shabdha</h1>
          <p className="font-body text-muted text-sm tracking-wide">
            your personal language dictionary
          </p>
        </div>

        <div className="card p-8">
          {isForgotPassword ? (
            <>
              <h2 className="font-display text-2xl font-semibold text-ink mb-2">Reset password</h2>
              <p className="font-body text-sm text-muted mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block font-body text-sm font-medium text-ink/70 mb-1.5">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending...' : 'Send reset email'}
                </button>
              </form>
              <button
                onClick={() => setIsForgotPassword(false)}
                className="font-body text-sm text-center text-muted hover:text-accent mt-4 w-full transition-colors"
              >
                ← Back to sign in
              </button>
            </>
          ) : (
            <>
              <h2 className="font-display text-2xl font-semibold text-ink mb-6">
                {isSignup ? 'Create account' : 'Welcome back'}
              </h2>

              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 border border-ink/20 rounded-lg px-4 py-2.5 font-body text-sm font-medium text-ink hover:bg-ink/5 transition-colors duration-200 mb-4"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-ink/10" />
                <span className="font-body text-xs text-muted">or</span>
                <div className="flex-1 h-px bg-ink/10" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block font-body text-sm font-medium text-ink/70 mb-1.5">Email</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block font-body text-sm font-medium text-ink/70 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  {!isSignup && (
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="font-body text-xs text-accent hover:underline mt-1.5 float-right"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
                </button>
              </form>

              <p className="font-body text-sm text-center text-muted mt-6">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => setIsSignup(!isSignup)}
                  className="text-accent font-medium hover:underline"
                >
                  {isSignup ? 'Sign in' : 'Sign up'}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center font-body text-xs text-muted mt-6">
          शब्द — the word that starts the journey
        </p>
      </div>
    </div>
  )
}
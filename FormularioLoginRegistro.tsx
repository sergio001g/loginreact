'use client'

import React, { useState, useEffect, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/componentes/ui/button"
import { Input } from "@/componentes/ui/input"
import { Card, CardContent } from "@/componentes/ui/card"
import { Eye, EyeOff, AlertTriangle, Moon, Sun, Check, SignpostIcon as StopSign, Twitter } from 'lucide-react'
import { cn } from "@/utilidades/utils"
import { keyframes } from '@emotion/react'
import zxcvbn from 'zxcvbn'

const GoogleIcon = lazy(() => import('@/componentes/iconos/GoogleIcon'))
const FacebookIcon = lazy(() => import('@/componentes/iconos/FacebookIcon'))
const GithubIcon = lazy(() => import('@/componentes/iconos/GithubIcon'))

const rainbow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const facebookGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

const githubGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`

type FormularioLoginRegistroProps = {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  onSocialLogin?: (provider: 'google' | 'facebook' | 'github' | 'twitter') => Promise<void>;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  termsUrl?: string;
  privacyUrl?: string;
}

export default function FormularioLoginRegistro({
  onSubmit,
  onSocialLogin = () => {
    console.warn('Función onSocialLogin no proporcionada');
    return Promise.resolve();
  },
  logoUrl = '/placeholder.svg?height=40&width=40',
  primaryColor = 'blue',
  secondaryColor = 'purple',
  termsUrl = '#',
  privacyUrl = '#'
}: FormularioLoginRegistroProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('es')
  const [rememberMe, setRememberMe] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' }
  ])
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  const [socialError, setSocialError] = useState<string | null>(null)

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(prefersDark)
  }, [])

  const validateForm = () => {
    let isValid = true
    const newErrors = { email: '', password: '', confirmPassword: '' }

    if (!email) {
      newErrors.email = language === 'es' ? 'Por favor, introduce tu correo electrónico' : 'Please enter your email'
      isValid = false
    } else if (!validateEmail(email)) {
      newErrors.email = language === 'es' ? 'Por favor, introduce un correo electrónico válido' : 'Please enter a valid email address'
      isValid = false
    }

    if (!password) {
      newErrors.password = language === 'es' ? 'Por favor, introduce tu contraseña' : 'Please enter your password'
      isValid = false
    } else if (!isLogin && (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password))) {
      newErrors.password = language === 'es' 
        ? 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número' 
        : 'Password must be at least 8 characters long, contain an uppercase letter and a number'
      isValid = false
    }

    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = language === 'es' ? 'Las contraseñas no coinciden' : 'Passwords do not match'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    if (twoFactorEnabled && !twoFactorCode) {
      setErrors({
        ...errors,
        password: language === 'es' ? 'Por favor, introduce el código de dos factores' : 'Please enter the two-factor code'
      })
      setIsLoading(false)
      return
    }

    try {
      await onSubmit({ email, password })
      if (twoFactorEnabled) {
        // Verificamos el código de dos factores (implementar lógica real aquí)
        console.log('Verificando código de dos factores:', twoFactorCode)
      }
    } catch (err) {
      setErrors({
        ...errors,
        password: language === 'es' ? 'Error al procesar la solicitud. Por favor, inténtelo de nuevo.' : 'Error processing request. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin)
    setError('')
    setErrors({ email: '', password: '', confirmPassword: '' })
  }

  const passwordStrength = (password: string) => {
    const result = zxcvbn(password)
    return result.score // 0 to 4
  }

  const strength = passwordStrength(password)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'en' : 'es')
  }

  const showCopyrightMessage = () => {
    const message = language === 'es' 
      ? 'Uso restringido en páginas web sin comprar derechos. © 2024 sergio001g. Todos los derechos reservados.' 
      : 'Restricted use on websites without purchasing rights. © 2024 sergio001g. All rights reserved.';
    
    const alertElement = document.createElement('div');
    alertElement.innerHTML = `
      <div class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 opacity-0 transition-opacity duration-300">
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full transform scale-95 transition-transform duration-300">
          <div class="flex items-center mb-4">
            <svg class="w-6 h-6 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <span class="text-lg font-semibold">${language === 'es' ? 'Aviso' : 'Warning'}</span>
          </div>
          <p class="text-gray-700">${message}</p>
          <button class="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors w-full">
            ${language === 'es' ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(alertElement);
    
    const modalContent = alertElement.querySelector('div');
    const closeButton = alertElement.querySelector('button');
    
    setTimeout(() => {
      modalContent?.classList.add('opacity-100');
      modalContent?.querySelector('div')?.classList.add('scale-100');
    }, 10);

    closeButton?.onclick = () => {
      modalContent?.classList.remove('opacity-100');
      modalContent?.querySelector('div')?.classList.remove('scale-100');
      setTimeout(() => {
        document.body.removeChild(alertElement);
      }, 300);
    };
  };

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí implementaríamos la lógica para recuperar la contraseña
    console.log('Forgot password for:', resetEmail);
    setForgotPasswordOpen(false);
    setResetEmail('');
  }

  const ErrorMessage = ({ message }: { message: string }) => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center text-red-500 text-sm mt-1"
    >
      <StopSign className="w-4 h-4 mr-2" />
      <span>{message}</span>
    </motion.div>
  )

  return (
    <div className={cn(
      "flex items-center justify-center min-h-screen p-4 transition-colors duration-200",
      darkMode ? "bg-gray-900" : "bg-gradient-to-br from-purple-50 to-blue-100"
    )}>
      <Card className={cn(
        "w-full max-w-4xl overflow-hidden shadow-xl transition-colors duration-200",
        darkMode ? "bg-gray-800" : "bg-white"
      )}>
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            <motion.div 
              className={cn(
                "flex-1 flex items-center justify-center p-8",
                isLogin ? 'rounded-b-[50%] md:rounded-r-[50%] md:rounded-l-none' : 'rounded-t-[50%] md:rounded-l-[50%] md:rounded-r-none',
                darkMode ? "bg-gray-700" : `bg-gradient-to-br from-${primaryColor}-500 to-${secondaryColor}-600`
              )}
              initial={false}
              animate={{ 
                x: isLogin ? '0%' : '100%',
                rotateY: 0
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ backfaceVisibility: 'hidden' }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <svg
                  className="w-20 h-20 mx-auto mb-4"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M50 10C34.5 10 22 22.5 22 38C22 53.5 34.5 66 50 66C65.5 66 78 78.5 78 94"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <path
                    d="M50 90C65.5 90 78 77.5 78 62C78 46.5 65.5 34 50 34C34.5 34 22 21.5 22 6"
                    stroke="white"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                </svg>
                <h3 className="text-3xl font-bold text-white mb-4">
                  {isLogin ? (language === 'es' ? '¿Nuevo aquí?' : 'New here?') : (language === 'es' ? '¿Ya tienes una cuenta?' : 'Already have an account?')}
                </h3>
                <p className="text-white mb-6">
                  {isLogin ? (language === 'es' ? 'Regístrate para comenzar tu viaje con nosotros' : 'Sign up to start your journey with us') : (language === 'es' ? 'Inicia sesión para continuar tu experiencia' : 'Log in to continue your experience')}
                </p>
                <Button
                  onClick={toggleForm}
                  className={cn(
                    "w-full rounded-full bg-white hover:bg-gray-100 transition-all duration-300 transform hover:scale-105",
                    darkMode ? "text-gray-800" : `text-${primaryColor}-600`
                  )}
                >
                  {isLogin ? (language === 'es' ? 'Registrarse' : 'Sign Up') : (language === 'es' ? 'Iniciar Sesión' : 'Log In')}
                </Button>
              </motion.div>
            </motion.div>
            <motion.div 
              className={cn(
                "flex-1 p-8",
                darkMode ? "text-white" : "text-gray-800"
              )}
              initial={false}
              animate={{ x: isLogin ? '0%' : '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <motion.h2 
                className="text-3xl font-bold mb-6 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {isLogin ? (language === 'es' ? 'Iniciar Sesión' : 'Log In') : (language === 'es' ? 'Registrarse' : 'Sign Up')}
              </motion.h2>
              <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder={language === 'es' ? "Correo Electrónico" : "Email"}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errors.email) {
                        setErrors({ ...errors, email: '' })
                      }
                    }}
                    required
                    aria-label={language === 'es' ? "Correo Electrónico" : "Email"}
                    className={cn(
                      "bg-white border-2 transition-colors",
                      errors.email ? "border-red-500" : "border-gray-300 focus:border-blue-500",
                      darkMode && "bg-gray-700 border-gray-600 text-white"
                    )}
                  />
                  <AnimatePresence>
                    {errors.email && <ErrorMessage message={errors.email} />}
                  </AnimatePresence>
                </div>
                <div className="space-y-2">
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={language === 'es' ? "Contraseña" : "Password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (errors.password) {
                          setErrors({ ...errors, password: '' })
                        }
                      }}
                      required
                      className={cn(
                        "bg-white border-2 transition-colors pr-10",
                        errors.password ? "border-red-500" : "border-gray-300 focus:border-blue-500",
                        darkMode && "bg-gray-700 border-gray-600 text-white"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <AnimatePresence>
                    {errors.password && <ErrorMessage message={errors.password} />}
                  </AnimatePresence>
                  {!isLogin && (
                    <div className="space-y-2">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={cn(
                              "h-2 w-1/4 rounded-full",
                              {
                                "bg-red-500": strength >= level && strength < 2,
                                "bg-yellow-500": strength >= level && strength === 2,
                                "bg-green-500": strength >= level && strength > 2,
                                "bg-gray-200 dark:bg-gray-700": strength < level,
                              }
                            )}
                          />
                        ))}
                      </div>
                      <span className={cn(
                        "text-xs",
                        {
                          "text-red-500": strength < 2,
                          "text-yellow-500": strength === 2,
                          "text-green-500": strength > 2,
                        }
                      )}>
                        {strength < 2 ? (language === 'es' ? "Débil" : "Weak") : 
                         strength === 2 ? (language === 'es' ? "Buena" : "Good") : 
                         (language === 'es' ? "Fuerte" : "Strong")}
                      </span>
                    </div>
                  )}
                </div>
                {!isLogin && (
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder={language === 'es' ? "Confirmar Contraseña" : "Confirm Password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (errors.confirmPassword) {
                          setErrors({ ...errors, confirmPassword: '' })
                        }
                      }}
                      required
                      className={cn(
                        "bg-white border-2 transition-colors",
                        errors.confirmPassword ? "border-red-500" : "border-gray-300 focus:border-blue-500",
                        darkMode && "bg-gray-700 border-gray-600 text-white"
                      )}
                    />
                    <AnimatePresence>
                      {errors.confirmPassword && <ErrorMessage message={errors.confirmPassword} />}
                    </AnimatePresence>
                  </div>
                )}
                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="mr-2"
                      />
                      <span className="text-sm text-black dark:text-white">{language === 'es' ? 'Recuérdame' : 'Remember me'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordOpen(true)}
                      className="text-sm text-blue-500 hover:underline"
                    >
                      {language === 'es' ? '¿Olvidaste tu contraseña?' : 'Forgot password?'}
                    </button>
                  </div>
                )}
                {twoFactorEnabled && (
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder={language === 'es' ? "Código de dos factores" : "Two-factor code"}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      required
                      className={cn(
                        "bg-white border-2 transition-colors",
                        "border-gray-300 focus:border-blue-500",
                        darkMode && "bg-gray-700 border-gray-600 text-white"
                      )}
                    />
                  </div>
                )}
                <Button 
                  type="submit" 
                  className={cn(
                    "w-full rounded-full transition-all duration-300 transform hover:scale-105",
                    darkMode ? "bg-blue-600 hover:bg-blue-700" : `bg-gradient-to-r from-${primaryColor}-500 to-${secondaryColor}-600 hover:from-${primaryColor}-600 hover:to-${secondaryColor}-700`
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (language === 'es' ? 'Cargando...' : 'Loading...') : (isLogin ? (language === 'es' ? 'Iniciar Sesión' : 'Log In') : (language === 'es' ? 'Registrarse' : 'Sign Up'))}
                </Button>
              </form>
              <div className="mt-6 space-y-3 w-full max-w-sm mx-auto">
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full rounded-full transition-all duration-300 flex items-center justify-center gap-2 py-2 px-4",
                    darkMode && "border-gray-600 text-white",
                    "bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500",
                    "hover:shadow-lg hover:scale-105"
                  )}
                  style={{ 
                    backgroundSize: '200% 200%',
                    animation: 'rainbow 5s linear infinite',
                  }}
                  onClick={async () => {
                    setSocialLoading('google');
                    setSocialError(null);
                    try {
                      await onSocialLogin('google');
                    } catch (error) {
                      setSocialError(language === 'es' ? 'Error al iniciar sesión con Google' : 'Error logging in with Google');
                    }
                    setSocialLoading(null);
                  }}
                  disabled={socialLoading !== null}
                  aria-label={language === 'es' ? 'Continuar con Google' : 'Continue with Google'}
                >
                  <div className="absolute inset-0 bg-white opacity-90"></div>
                  <span className="relative flex items-center text-gray-800 font-semibold">
                    <Suspense fallback={<div className="w-5 h-5 mr-2"></div>}>
                      <GoogleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                    </Suspense>
                    {language === 'es' ? 'Continuar con Google' : 'Continue with Google'}
                    {socialLoading === 'google' && <span className="ml-2">...</span>}
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full rounded-full transition-all duration-300 flex items-center justify-center gap-2 py-2 px-4",
                    darkMode && "border-gray-600 text-white",
                    "bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800",
                    "hover:shadow-lg hover:scale-105"
                  )}
                  style={{ 
                    backgroundSize: '200% 200%',
                    animation: 'facebookGradient 5s ease infinite',
                  }}
                  onClick={async () => {
                    setSocialLoading('facebook');
                    setSocialError(null);
                    try {
                      await onSocialLogin('facebook');
                    } catch (error) {
                      setSocialError(language === 'es' ? 'Error al iniciar sesión con Facebook' : 'Error logging in with Facebook');
                    }
                    setSocialLoading(null);
                  }}
                  disabled={socialLoading !== null}
                  aria-label={language === 'es' ? 'Continuar con Facebook' : 'Continue with Facebook'}
                >
                  <div className="absolute inset-0 bg-white opacity-90"></div>
                  <span className="relative flex items-center text-[#1877F2] font-semibold">
                    <Suspense fallback={<div className="w-5 h-5 mr-2"></div>}>
                      <FacebookIcon className="w-5 h-5 mr-2" />
                    </Suspense>
                    {language === 'es' ? 'Continuar con Facebook' : 'Continue with Facebook'}
                    {socialLoading === 'facebook' && <span className="ml-2">...</span>}
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full rounded-full transition-all duration-300 flex items-center justify-center gap-2 py-2 px-4",
                    darkMode && "border-gray-600 text-white",
                    "bg-gradient-to-r from-gray-700 via-gray-900 to-black",
                    "hover:shadow-lg hover:scale-105"
                  )}
                  style={{ 
                    backgroundSize: '200% 200%',
                    animation: 'githubGradient 5s ease infinite',
                  }}
                  onClick={async () => {
                    setSocialLoading('github');
                    setSocialError(null);
                    try {
                      await onSocialLogin('github');
                    } catch (error) {
                      setSocialError(language === 'es' ? 'Error al iniciar sesión con GitHub' : 'Error logging in with GitHub');
                    }
                    setSocialLoading(null);
                  }}
                  disabled={socialLoading !== null}
                  aria-label={language === 'es' ? 'Continuar con GitHub' : 'Continue with GitHub'}
                >
                  <div className="absolute inset-0 bg-white opacity-90"></div>
                  <span className="relative flex items-center text-gray-900 font-semibold">
                    <Suspense fallback={<div className="w-5 h-5 mr-2"></div>}>
                      <GithubIcon className="w-5 h-5 mr-2" />
                    </Suspense>
                    {language === 'es' ? 'Continuar con GitHub' : 'Continue with GitHub'}
                    {socialLoading === 'github' && <span className="ml-2">...</span>}
                  </span>
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-full rounded-full transition-all duration-300 flex items-center justify-center gap-2 py-2 px-4",
                    darkMode && "border-gray-600 text-white",
                    "bg-gradient-to-r from-blue-400 to-blue-500",
                    "hover:shadow-lg hover:scale-105"
                  )}
                  onClick={async () => {
                    setSocialLoading('twitter');
                    setSocialError(null);
                    try {
                      await onSocialLogin('twitter');
                    } catch (error) {
                      setSocialError(language === 'es' ? 'Error al iniciar sesión con Twitter' : 'Error logging in with Twitter');
                    }
                    setSocialLoading(null);
                  }}
                  disabled={socialLoading !== null}
                  aria-label={language === 'es' ? 'Continuar con Twitter' : 'Continue with Twitter'}
                >
                  <div className="absolute inset-0 bg-white opacity-90"></div>
                  <span className="relative flex items-center text-[#1DA1F2] font-semibold">
                    <Twitter className="w-5 h-5 mr-2" />
                    {language === 'es' ? 'Continuar con Twitter' : 'Continue with Twitter'}
                    {socialLoading === 'twitter' && <span className="ml-2">...</span>}
                  </span>
                </Button>
              </div>
              {socialError && (
                <p className="text-red-500 text-sm text-center mt-2">{socialError}</p>
              )}
              <div className="mt-6 text-center text-sm">
                <button 
                  onClick={showCopyrightMessage}
                  className="text-blue-500 hover:underline"
                >
                  {language === 'es' ? 'Política de Privacidad' : 'Privacy Policy'}
                </button>
              </div>
              <div className="mt-6 text-center text-xs text-gray-500">
                <p>© 2024 sergio001g. Todos los derechos reservados.</p>
                <a 
                  href="https://github.com/sergio001g" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mt-1 inline-block"
                >
                  GitHub: sergio001g
                </a>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
      <div className="fixed top-4 right-4 space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          className={cn(
            "rounded-full",
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
          )}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className={cn(
            "rounded-full",
            darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
          )}
        >
          {language === 'es' ? 'EN' : 'ES'}
        </Button>
      </div>
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className={cn(
            "w-full max-w-md",
            darkMode ? "bg-gray-800 text-white" : "bg-white"
          )}>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">
                {language === 'es' ? 'Recuperar Contraseña' : 'Reset Password'}
              </h3>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Input
                  type="email"
                  placeholder={language === 'es' ? "Correo Electrónico" : "Email"}
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className={cn(
                    "bg-white border-2 border-gray-300 focus:border-blue-500 transition-colors",
                    darkMode && "bg-gray-700 border-gray-600 text-white"
                  )}
                />
                <Button
                  type="submit"
                  className={cn(
                    "w-full rounded-full transition-all duration-300 transform hover:scale-105",
                    darkMode ? "bg-blue-600 hover:bg-blue-700" : `bg-gradient-to-r from-${primaryColor}-500 to-${secondaryColor}-600 hover:from-${primaryColor}-600 hover:to-${secondaryColor}-700`
                  )}
                >
                  {language === 'es' ? 'Enviar Enlace de Recuperación' : 'Send Reset Link'}
                </Button>
              </form>
              <button
                onClick={() => setForgotPasswordOpen(false)}
                className="mt-4 text-sm text-gray-500 hover:underline"
              >
                {language === 'es' ? 'Cancelar' : 'Cancel'}
                            </button>
            </CardContent></Card>
        </div>
      )}
    </div>
  )
}


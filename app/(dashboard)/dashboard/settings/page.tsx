'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from '@/lib/axios'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/lib/store/authStore'
import {
  Settings,
  User,
  Lock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PageTransition from '@/components/ui/PageTransition'
import { getInitials } from '@/lib/utils'

// ── Schemas ──────────────────────────────────────────────────────────────────
const profileSchema = z.object({
  name: z.string().min(2, 'Min 2 chars').max(50),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(6, 'Min 6 chars'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// ── Helpers ───────────────────────────────────────────────────────────────────
function getPasswordStrength(password: string): number {
  if (!password) return 0
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return score
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user } = useAuth()
  const { setAuth, accessToken } = useAuthStore()

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState('profile')

  // ── Loading states ──
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)

  // ── Notification prefs ──
  const [notifPrefs, setNotifPrefs] = useState({
    emailOnStatusChange: true,
    weeklySummary: true,
    boardInvite: true,
  })
  const [savedIndicator, setSavedIndicator] = useState(false)

  // ── Password visibility ──
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  // ── Profile form ──
  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  })

  // ── Password form ──
  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    watch: passwordWatch,
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const watchNewPassword = passwordWatch('newPassword')

  // ── Sync user data into form ──
  useEffect(() => {
    if (user?.name) {
      resetProfile({ name: user.name })
    }
    if (user?.notificationPrefs) {
      setNotifPrefs({
        emailOnStatusChange: user.notificationPrefs.emailOnStatusChange ?? true,
        weeklySummary: user.notificationPrefs.weeklySummary ?? true,
        boardInvite: user.notificationPrefs.boardInvite ?? true,
      })
    }
  }, [user, resetProfile])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      setIsProfileLoading(true)
      const res = await axios.patch('/user/profile', { name: data.name })
      if (res.data.success) {
        toast.success('Profile updated!')
        if (user && accessToken) {
          setAuth({ ...user, name: data.name }, accessToken)
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update profile')
    } finally {
      setIsProfileLoading(false)
    }
  }

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setIsPasswordLoading(true)
      const res = await axios.patch('/user/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      if (res.data.success) {
        toast.success('Password updated successfully')
        resetPassword()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password')
    } finally {
      setIsPasswordLoading(false)
    }
  }

  const toggleNotification = async (key: keyof typeof notifPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    try {
      await axios.patch('/user/profile', { notificationPrefs: updated })
      if (user && accessToken) {
        setAuth({ ...user, notificationPrefs: updated } as any, accessToken)
      }
      setSavedIndicator(true)
      setTimeout(() => setSavedIndicator(false), 2000)
    } catch {
      toast.error('Failed to save preferences')
      setNotifPrefs(notifPrefs) // revert
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PageTransition>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* PAGE HEADER */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={22} color="#0ea5e9" />
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2f0ff', margin: 0 }}>
              Settings
            </h1>
          </div>
          <p style={{ fontSize: 14, color: '#7096b8', marginTop: 4 }}>
            Manage your account preferences
          </p>
        </div>

        {/* TABS */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 16,
        }}>
          {[
            { id: 'profile',       label: 'Profile',       Icon: User },
            { id: 'security',      label: 'Security',      Icon: Lock },
            { id: 'notifications', label: 'Notifications', Icon: Bell },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 20px',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                border: activeTab === id
                  ? '1px solid rgba(14,165,233,0.3)'
                  : '1px solid rgba(255,255,255,0.06)',
                background: activeTab === id
                  ? 'rgba(14,165,233,0.1)'
                  : 'transparent',
                color: activeTab === id ? '#0ea5e9' : '#7096b8',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ── */}
        {activeTab === 'profile' && (
          <div style={{
            background: '#0d1421',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 32,
          }}>
            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 700,
                color: 'white',
                margin: '0 auto 12px',
              }}>
                {getInitials(user?.name || 'U')}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#e2f0ff' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: 14, color: '#7096b8', marginTop: 2 }}>
                {user?.email}
              </div>
              <div style={{ fontSize: 12, color: '#4a6080', marginTop: 4 }}>
                Member since{' '}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'N/A'}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleProfileSubmit(onProfileSubmit)}>

              {/* Full Name */}
              <div style={{ marginBottom: 20 }}>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#7096b8',
                  marginBottom: 8,
                }}>
                  Full Name
                </label>
                <input
                  {...profileRegister('name')}
                  placeholder="Your full name"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 10,
                    color: '#e2f0ff',
                    fontSize: 14,
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#0ea5e9'
                    e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                {profileErrors.name && (
                  <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>
                    {profileErrors.name.message as string}
                  </p>
                )}
              </div>

              {/* Email (read-only) */}
              <div style={{ marginBottom: 28 }}>
                <label style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#7096b8',
                  marginBottom: 8,
                }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={user?.email || ''}
                    readOnly
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 14px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 10,
                      color: '#4a6080',
                      fontSize: 14,
                      outline: 'none',
                      cursor: 'not-allowed',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Lock
                    size={14}
                    color="#3d5a7a"
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  />
                </div>
                <p style={{ fontSize: 12, color: '#3d5a7a', marginTop: 6 }}>
                  Contact support to change your email address
                </p>
              </div>

              {/* Save button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={isProfileLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 28px',
                    background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
                    border: 'none',
                    borderRadius: 10,
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: isProfileLoading ? 'not-allowed' : 'pointer',
                    opacity: isProfileLoading ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isProfileLoading
                    ? <><LoadingSpinner size="sm" /> Saving...</>
                    : <><Save size={15} /> Save Changes</>
                  }
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── SECURITY TAB ── */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Change Password Card */}
            <div style={{
              background: '#0d1421',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: 32,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <Lock size={18} color="#0ea5e9" />
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#e2f0ff', margin: 0 }}>
                  Change Password
                </h2>
              </div>

              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                {(
                  [
                    ['currentPassword', 'Current Password'],
                    ['newPassword',     'New Password'],
                    ['confirmPassword', 'Confirm New Password'],
                  ] as const
                ).map(([field, label], idx) => (
                  <div key={field} style={{ marginBottom: idx === 2 ? 24 : 20 }}>
                    <label style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#7096b8',
                      marginBottom: 8,
                    }}>
                      {label}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        {...passwordRegister(field)}
                        type={showPasswords[field] ? 'text' : 'password'}
                        placeholder={label}
                        style={{
                          width: '100%',
                          padding: '11px 44px 11px 14px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: 10,
                          color: '#e2f0ff',
                          fontSize: 14,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0ea5e9'
                          e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.1)'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = 'rgba(255,255,255,0.08)'
                          e.target.style.boxShadow = 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((p) => ({ ...p, [field]: !p[field] }))
                        }
                        style={{
                          position: 'absolute',
                          right: 12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 4,
                          color: '#4a6080',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {showPasswords[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {passwordErrors[field] && (
                      <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>
                        {passwordErrors[field]?.message as string}
                      </p>
                    )}

                    {/* Strength bar — only for newPassword */}
                    {field === 'newPassword' && watchNewPassword && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                          {[1, 2, 3, 4].map((i) => {
                            const strength = getPasswordStrength(watchNewPassword)
                            const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e']
                            return (
                              <div
                                key={i}
                                style={{
                                  flex: 1,
                                  height: 4,
                                  borderRadius: 2,
                                  background:
                                    i <= strength
                                      ? colors[strength - 1]
                                      : 'rgba(255,255,255,0.08)',
                                  transition: 'background 0.2s ease',
                                }}
                              />
                            )
                          })}
                        </div>
                        <p style={{ fontSize: 11, color: '#7096b8' }}>
                          {['', 'Weak', 'Fair', 'Good', 'Strong'][
                            getPasswordStrength(watchNewPassword)
                          ]}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={isPasswordLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 28px',
                      background: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
                      border: 'none',
                      borderRadius: 10,
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: isPasswordLoading ? 'not-allowed' : 'pointer',
                      opacity: isPasswordLoading ? 0.7 : 1,
                    }}
                  >
                    {isPasswordLoading
                      ? <><LoadingSpinner size="sm" /> Updating...</>
                      : <><Check size={15} /> Update Password</>
                    }
                  </button>
                </div>
              </form>
            </div>

            {/* Security Info Card */}
            <div style={{
              background: 'rgba(34,197,94,0.05)',
              border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: 12,
              padding: 20,
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                flexShrink: 0,
                background: 'rgba(34,197,94,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Shield size={20} color="#22c55e" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#4ade80', marginBottom: 4 }}>
                  Account Secured
                </div>
                <div style={{ fontSize: 13, color: '#7096b8', lineHeight: 1.5 }}>
                  Your password is hashed with bcrypt (12 rounds).
                  Sessions expire after 7 days for your protection.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS TAB ── */}
        {activeTab === 'notifications' && (
          <div style={{
            background: '#0d1421',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 32,
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#e2f0ff', marginBottom: 24 }}>
              Email Notifications
            </div>

            {[
              {
                key: 'emailOnStatusChange',
                title: 'Application Status Change',
                desc: 'Get an email when your application status updates',
              },
              {
                key: 'weeklySummary',
                title: 'Weekly Summary',
                desc: 'Receive a weekly digest of your job search progress',
              },
              {
                key: 'boardInvite',
                title: 'Board Invites',
                desc: 'Get notified when someone invites you to a board',
              },
            ].map(({ key, title, desc }, idx, arr) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 0',
                  borderBottom:
                    idx < arr.length - 1
                      ? '1px solid rgba(255,255,255,0.05)'
                      : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#e2f0ff', marginBottom: 3 }}>
                    {title}
                  </div>
                  <div style={{ fontSize: 12, color: '#7096b8' }}>{desc}</div>
                </div>

                {/* Toggle switch */}
                <div
                  onClick={() => toggleNotification(key as keyof typeof notifPrefs)}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    background: notifPrefs[key as keyof typeof notifPrefs]
                      ? '#0ea5e9'
                      : 'rgba(255,255,255,0.1)',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: 'white',
                      top: 3,
                      left: notifPrefs[key as keyof typeof notifPrefs] ? 23 : 3,
                      transition: 'left 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }}
                  />
                </div>
              </div>
            ))}

            {savedIndicator && (
              <div style={{
                marginTop: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#4ade80',
                fontSize: 13,
              }}>
                <Check size={14} /> Preferences saved
              </div>
            )}
          </div>
        )}

      </div>
    </PageTransition>
  )
}

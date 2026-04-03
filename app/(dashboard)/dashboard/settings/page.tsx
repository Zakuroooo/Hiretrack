'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from '@/lib/axios'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useAuthStore } from '@/lib/store/authStore'
import { motion } from 'framer-motion'
import { 
  User, Lock, Bell, Trash2, Shield, Save, 
  Eye, EyeOff, Check, Settings as SettingsIcon 
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PageTransition from '@/components/ui/PageTransition'
import { getInitials } from '@/lib/utils'

const CARD_STYLE = {
  background: '#0d1421',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  padding: '24px',
}

const INPUT_STYLE = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10,
  padding: '10px 14px',
  color: '#e2f0ff',
  fontSize: 14,
  outline: 'none',
}

const profileSchema = z.object({
  name: z.string().min(2, 'Min 2 chars').max(50)
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(6, 'Min 6 chars'),
  confirmPassword: z.string()
}).refine(d => d.newPassword === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})

export default function SettingsPage() {
  const { user } = useAuth()
  const { setAuth, accessToken } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [notifPrefs, setNotifPrefs] = useState({
    emailOnStatusChange: true,
    weeklySummary: true,
    boardInvite: true
  })

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' }
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
  })

  useEffect(() => {
    if (user?.name) {
      profileForm.reset({ name: user.name })
    }
    const currentUser = user as any;
    if (currentUser?.notificationPrefs) {
      setNotifPrefs({
        emailOnStatusChange: currentUser.notificationPrefs.emailOnStatusChange ?? true,
        weeklySummary: currentUser.notificationPrefs.weeklySummary ?? true,
        boardInvite: currentUser.notificationPrefs.boardInvite ?? true
      })
    }
  }, [user, profileForm])

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      setIsSaving(true)
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
      setIsSaving(false)
    }
  }

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setIsSaving(true)
      const res = await axios.patch('/user/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      if (res.data.success) {
        toast.success('Password updated successfully')
        passwordForm.reset()
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update password')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async (key: keyof typeof notifPrefs) => {
    const newPrefs = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(newPrefs)
    
    try {
      await axios.patch('/user/profile', { notificationPrefs: newPrefs })
      toast.success('Preferences saved')
      if (user && accessToken) {
        setAuth({ ...user, notificationPrefs: newPrefs } as any, accessToken)
      }
    } catch (err: any) {
      toast.error('Failed to save preferences')
      setNotifPrefs(notifPrefs)
    }
  }

  const getPasswordStrengthColor = (pwd: string) => {
    if (pwd.length < 6) return '#ef4444'
    if (pwd.length < 8) return '#f59e0b'
    const hasNumber = /\d/.test(pwd)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    if (pwd.length >= 8 && hasNumber && hasSpecial) return '#22c55e'
    if (pwd.length >= 8 && hasNumber) return '#eab308'
    return '#f59e0b'
  }

  const newPasswordValue = passwordForm.watch('newPassword')

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <header className="mb-[28px]">
          <div className="flex items-center gap-3">
            <SettingsIcon size={22} color="#0ea5e9" />
            <div>
              <h1 className="text-[22px] font-bold text-[#e2f0ff] leading-tight">Settings</h1>
              <p className="text-[#7096b8] text-sm leading-tight mt-1">Manage your account preferences</p>
            </div>
          </div>
        </header>

        <div className="flex gap-1 mb-[24px]">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[14px] font-medium cursor-pointer transition-all ${
              activeTab === 'profile' 
                ? 'bg-sky-500/10 text-[#0ea5e9] border border-sky-500/20' 
                : 'bg-transparent text-[#7096b8] border border-white/5 hover:bg-white/5'
            }`}
          >
            <User size={16} /> Profile
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[14px] font-medium cursor-pointer transition-all ${
              activeTab === 'security' 
                ? 'bg-sky-500/10 text-[#0ea5e9] border border-sky-500/20' 
                : 'bg-transparent text-[#7096b8] border border-white/5 hover:bg-white/5'
            }`}
          >
            <Lock size={16} /> Security
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[14px] font-medium cursor-pointer transition-all ${
              activeTab === 'notifications' 
                ? 'bg-sky-500/10 text-[#0ea5e9] border border-sky-500/20' 
                : 'bg-transparent text-[#7096b8] border border-white/5 hover:bg-white/5'
            }`}
          >
            <Bell size={16} /> Notifications
          </button>
        </div>

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={CARD_STYLE}>
            <div className="flex flex-col items-center mb-[24px]">
              <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-white text-[28px] font-bold bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] mb-4">
                {getInitials(user?.name || 'U')}
              </div>
              <h2 className="text-[18px] font-semibold text-[#e2f0ff]">{user?.name}</h2>
              <p className="text-[14px] text-[#7096b8] mt-1">{user?.email}</p>
              <p className="text-[12px] text-[#4a6080] mt-1">
                Member since {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4 max-w-md mx-auto">
              <div>
                <label className="block text-[#7096b8] text-xs font-medium mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  style={INPUT_STYLE}
                  {...profileForm.register('name')} 
                />
                {profileForm.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.name.message as string}</p>
                )}
              </div>
              
              <div>
                <label className="block text-[#7096b8] text-xs font-medium mb-1.5">Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    style={{...INPUT_STYLE, color: '#4a6080', cursor: 'not-allowed', paddingLeft: '36px'}}
                    value={user?.email || ''} 
                    readOnly 
                  />
                  <Lock size={14} className="absolute left-3 top-3.5 text-[#4a6080]" />
                </div>
                <p className="text-[#4a6080] text-[11px] mt-1.5">Contact support to change email</p>
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full mt-4 bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] hover:opacity-90 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-opacity"
              >
                {isSaving ? <LoadingSpinner size="sm" /> : <Save size={16} />} 
                Save Changes
              </button>
            </form>
          </motion.div>
        )}

        {activeTab === 'security' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div style={CARD_STYLE}>
              <div className="flex items-center gap-2 mb-6">
                <Lock size={16} className="text-[#0ea5e9]" />
                <h2 className="text-[16px] font-semibold text-[#e2f0ff]">Change Password</h2>
              </div>

              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-[#7096b8] text-xs font-medium mb-1.5">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showCurrentPassword ? "text" : "password"} 
                      style={{...INPUT_STYLE, paddingRight: '36px'}}
                      {...passwordForm.register('currentPassword')} 
                    />
                    <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-2.5 text-[#7096b8]">
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.currentPassword.message as string}</p>}
                </div>

                <div>
                  <label className="block text-[#7096b8] text-xs font-medium mb-1.5">New Password</label>
                  <div className="relative">
                    <input 
                      type={showNewPassword ? "text" : "password"} 
                      style={{...INPUT_STYLE, paddingRight: '36px'}}
                      {...passwordForm.register('newPassword')} 
                    />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-2.5 text-[#7096b8]">
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPasswordValue.length > 0 && (
                    <div className="mt-2 h-1 rounded-full w-full bg-white/5 overflow-hidden">
                      <div className="h-full transition-all duration-300" style={{ width: `${Math.min((newPasswordValue.length / 8) * 100, 100)}%`, backgroundColor: getPasswordStrengthColor(newPasswordValue) }} />
                    </div>
                  )}
                  {passwordForm.formState.errors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.newPassword.message as string}</p>}
                </div>

                <div>
                  <label className="block text-[#7096b8] text-xs font-medium mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      style={{...INPUT_STYLE, paddingRight: '36px'}}
                      {...passwordForm.register('confirmPassword')} 
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-[#7096b8]">
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message as string}</p>}
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-auto px-6 bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] hover:opacity-90 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-opacity"
                  >
                    {isSaving ? <LoadingSpinner size="sm" /> : null} 
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-4 flex gap-3">
              <Shield size={20} className="text-green-500 shrink-0" />
              <div>
                <p className="text-[#e2f0ff] text-[13px] font-medium mb-1">Your account is secured with bcrypt hashing</p>
                <p className="text-[#7096b8] text-[12px]">Sessions expire after 7 days automatically for your protection.</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={CARD_STYLE}>
            <div className="space-y-1 w-full max-w-xl">
              <div className="flex justify-between items-center py-4 border-b border-white/5">
                <div>
                  <h3 className="text-[13px] font-semibold text-[#e2f0ff]">Email on Status Change</h3>
                  <p className="text-[12px] text-[#7096b8] mt-0.5">Get notified when application status changes</p>
                </div>
                <div 
                  onClick={() => handleToggle('emailOnStatusChange')}
                  className="relative w-[44px] h-[24px] rounded-[12px] cursor-pointer transition-colors duration-200 flex items-center"
                  style={{ backgroundColor: notifPrefs.emailOnStatusChange ? '#0ea5e9' : 'rgba(255,255,255,0.1)' }}
                >
                  <div 
                    className={`absolute w-[20px] h-[20px] bg-white rounded-full transition-transform duration-200 ${notifPrefs.emailOnStatusChange ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-white/5">
                <div>
                  <h3 className="text-[13px] font-semibold text-[#e2f0ff]">Weekly Summary</h3>
                  <p className="text-[12px] text-[#7096b8] mt-0.5">Receive weekly digest of your job search</p>
                </div>
                <div 
                  onClick={() => handleToggle('weeklySummary')}
                  className="relative w-[44px] h-[24px] rounded-[12px] cursor-pointer transition-colors duration-200 flex items-center"
                  style={{ backgroundColor: notifPrefs.weeklySummary ? '#0ea5e9' : 'rgba(255,255,255,0.1)' }}
                >
                  <div 
                    className={`absolute w-[20px] h-[20px] bg-white rounded-full transition-transform duration-200 ${notifPrefs.weeklySummary ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center py-4">
                <div>
                  <h3 className="text-[13px] font-semibold text-[#e2f0ff]">Board Invites</h3>
                  <p className="text-[12px] text-[#7096b8] mt-0.5">Get notified when invited to a board</p>
                </div>
                <div 
                  onClick={() => handleToggle('boardInvite')}
                  className="relative w-[44px] h-[24px] rounded-[12px] cursor-pointer transition-colors duration-200 flex items-center"
                  style={{ backgroundColor: notifPrefs.boardInvite ? '#0ea5e9' : 'rgba(255,255,255,0.1)' }}
                >
                  <div 
                    className={`absolute w-[20px] h-[20px] bg-white rounded-full transition-transform duration-200 ${notifPrefs.boardInvite ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}

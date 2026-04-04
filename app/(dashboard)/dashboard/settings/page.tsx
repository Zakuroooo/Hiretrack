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
  User, Lock, Bell, Shield, Save, 
  Eye, EyeOff, Settings as SettingsIcon 
} from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import PageTransition from '@/components/ui/PageTransition'
import { getInitials } from '@/lib/utils'

const CARD_STYLE = {
  background: '#0d1421',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  padding: '28px',
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

  // 4 segment strength calculations
  const newPasswordValue = passwordForm.watch('newPassword') || '';
  let strengthScore = 0;
  if (newPasswordValue.length > 0) strengthScore++;
  if (newPasswordValue.length >= 6) strengthScore++;
  if (newPasswordValue.length >= 8 && /\d/.test(newPasswordValue)) strengthScore++;
  if (newPasswordValue.length >= 8 && /[!@#$%^&*(),.?":{}|<>]/.test(newPasswordValue)) strengthScore++;

  const renderStrengthBars = () => {
    const colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e'];
    let color = 'rgba(255,255,255,0.05)';
    if (strengthScore === 1) color = colors[0];
    if (strengthScore === 2) color = colors[1];
    if (strengthScore === 3) color = colors[2];
    if (strengthScore >= 4) color = colors[3];
    
    return (
      <div className="flex gap-1 mt-2">
        {[1, 2, 3, 4].map((level) => (
          <div 
            key={level} 
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: level <= strengthScore ? color : 'rgba(255,255,255,0.05)' }}
          />
        ))}
      </div>
    );
  }

  const TabButton = ({ id, icon: Icon, label }: { id: string, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className="focus:outline-none"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        background: activeTab === id ? 'rgba(14,165,233,0.1)' : 'transparent',
        color: activeTab === id ? '#0ea5e9' : '#7096b8',
        border: activeTab === id ? '1px solid rgba(14,165,233,0.2)' : '1px solid rgba(255,255,255,0.06)',
      }}
      onMouseEnter={(e) => {
        if (activeTab !== id) e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
      }}
      onMouseLeave={(e) => {
        if (activeTab !== id) e.currentTarget.style.background = 'transparent';
      }}
    >
      <Icon size={16} /> {label}
    </button>
  );

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto p-6 md:p-8">
        <header className="mb-7">
          <div className="flex items-center gap-3">
            <SettingsIcon size={22} color="#0ea5e9" />
            <div>
              <h1 className="text-[22px] font-bold text-[#e2f0ff] leading-tight">Settings</h1>
              <p className="text-[#7096b8] text-sm leading-tight mt-1">Manage your account preferences</p>
            </div>
          </div>
        </header>

        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: '16px'
        }}>
          <TabButton id="profile" icon={User} label="Profile" />
          <TabButton id="security" icon={Lock} label="Security" />
          <TabButton id="notifications" icon={Bell} label="Notifications" />
        </div>

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={CARD_STYLE}>
            <div className="flex flex-col items-center mb-8">
              <div className="w-[80px] h-[80px] rounded-full flex items-center justify-center text-white text-[28px] font-bold bg-gradient-to-br from-[#0ea5e9] to-[#2563eb] mb-4">
                {getInitials(user?.name || 'U')}
              </div>
              <h2 className="text-[18px] font-semibold text-[#e2f0ff]">{user?.name}</h2>
              <p className="text-[14px] text-[#7096b8] mt-1">{user?.email}</p>
              <p className="text-[12px] text-[#4a6080] mt-1">
                Member since {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>

            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-5 max-w-md mx-auto">
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

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] hover:opacity-90 text-white rounded-lg px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-opacity"
                >
                  {isSaving ? <LoadingSpinner size="sm" /> : <Save size={16} />} 
                  Save Changes
                </button>
              </div>
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
                  
                  {renderStrengthBars()}

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

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] hover:opacity-90 text-white rounded-lg px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-opacity"
                  >
                    {isSaving ? <LoadingSpinner size="sm" /> : <Save size={16} />} 
                    Update Password
                  </button>
                </div>
              </form>
            </div>

            <div style={{
              background: 'rgba(34,197,94,0.05)',
              border: '1px solid rgba(34,197,94,0.15)',
              borderRadius: '12px',
              padding: '16px',
            }} className="flex gap-3">
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
            <div className="space-y-0 w-full max-w-xl">
              
              {[
                { key: 'emailOnStatusChange' as const, title: 'Email on Status Change', desc: 'Get notified when application status changes' },
                { key: 'weeklySummary' as const, title: 'Weekly Summary', desc: 'Receive weekly digest of your job search' },
                { key: 'boardInvite' as const, title: 'Board Invites', desc: 'Get notified when invited to a board' },
              ].map((item, idx) => {
                const isOn = notifPrefs[item.key];
                return (
                  <div key={item.key} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: idx === 2 ? 'none' : '1px solid rgba(255,255,255,0.04)'
                  }}>
                    <div>
                      <h3 className="text-[13px] font-semibold text-[#e2f0ff]">{item.title}</h3>
                      <p className="text-[12px] text-[#7096b8] mt-0.5">{item.desc}</p>
                    </div>
                    <div 
                      onClick={() => handleToggle(item.key)}
                      style={{
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        background: isOn ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.2s ease',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <div 
                        style={{
                          position: 'absolute',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: 'white',
                          top: '3px',
                          left: isOn ? '23px' : '3px',
                          transition: 'left 0.2s ease'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
              
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}

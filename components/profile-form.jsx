"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

export default function ProfileForm({ role, data }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState(
    role === 'student'
      ? {
          name: data?.name || '',
          dob: data?.dob ? new Date(data.dob).toISOString().slice(0, 10) : '',
          skill_level: data?.skill_level || '',
          city: data?.city || '',
          state: data?.state || '',
          country: data?.country || '',
        }
      : {
          name: data?.name || '',
          contacts: data?.contacts || '',
        }
  )

  const [fieldErrors, setFieldErrors] = useState({})

  function validate() {
    const errors = {}
    const trimmedName = form.name.trim()

    // name is NOT NULL and VARCHAR(200)
    if (!trimmedName) {
      errors.name = 'Name is required'
    } else if (trimmedName.length > 200) {
      errors.name = 'Name must be 200 characters or fewer'
    }

    if (role === 'student') {
      if (form.skill_level && form.skill_level.length > 50) {
        errors.skill_level = 'Skill level must be 50 characters or fewer'
      }
      if (form.city && form.city.length > 100) {
        errors.city = 'City must be 100 characters or fewer'
      }
      if (form.state && form.state.length > 100) {
        errors.state = 'State must be 100 characters or fewer'
      }
      if (form.country && form.country.length > 100) {
        errors.country = 'Country must be 100 characters or fewer'
      }
    }

    if (role === 'instructor') {
      if (form.contacts && form.contacts.length > 200) {
        errors.contacts = 'Contacts must be 200 characters or fewer'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    // Clear field error on change
    if (fieldErrors[e.target.name]) {
      setFieldErrors((prev) => {
        const copy = { ...prev }
        delete copy[e.target.name]
        return copy
      })
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validate()) return

    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...form, name: form.name.trim() }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error(json.error || 'Failed to save profile')
      }
      setSuccess(true)
      router.refresh()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          maxLength={200}
          required
          placeholder="Enter your full name"
          className={fieldErrors.name ? 'border-destructive' : ''}
        />
        {fieldErrors.name && (
          <p className="text-xs text-destructive">{fieldErrors.name}</p>
        )}
      </div>

      {role === 'student' && (
        <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="skill_level">Skill Level</Label>
            <Input
              id="skill_level"
              name="skill_level"
              value={form.skill_level}
              onChange={handleChange}
              maxLength={50}
              placeholder="e.g. Beginner, Intermediate, Advanced"
              className={fieldErrors.skill_level ? 'border-destructive' : ''}
            />
            {fieldErrors.skill_level && (
              <p className="text-xs text-destructive">{fieldErrors.skill_level}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              maxLength={100}
              className={fieldErrors.city ? 'border-destructive' : ''}
            />
            {fieldErrors.city && (
              <p className="text-xs text-destructive">{fieldErrors.city}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state"
              value={form.state}
              onChange={handleChange}
              maxLength={100}
              className={fieldErrors.state ? 'border-destructive' : ''}
            />
            {fieldErrors.state && (
              <p className="text-xs text-destructive">{fieldErrors.state}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              name="country"
              value={form.country}
              onChange={handleChange}
              maxLength={100}
              className={fieldErrors.country ? 'border-destructive' : ''}
            />
            {fieldErrors.country && (
              <p className="text-xs text-destructive">{fieldErrors.country}</p>
            )}
          </div>
        </>
      )}

      {role === 'instructor' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="contacts">Contacts</Label>
          <Input
            id="contacts"
            name="contacts"
            value={form.contacts}
            onChange={handleChange}
            maxLength={200}
            placeholder="e.g. email or phone"
            className={fieldErrors.contacts ? 'border-destructive' : ''}
          />
          {fieldErrors.contacts && (
            <p className="text-xs text-destructive">{fieldErrors.contacts}</p>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-emerald-700 rounded-md bg-emerald-50 px-3 py-2 dark:bg-emerald-900/20 dark:text-emerald-300">
          Profile saved successfully!
        </p>
      )}

      <Button type="submit" disabled={saving} className="cursor-pointer">
        {saving ? 'Saving…' : 'Save Profile'}
      </Button>
    </form>
  )
}

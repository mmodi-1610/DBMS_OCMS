"use client"

import { useState } from 'react'

export default function ProfileForm({ role, data }) {
  const [form, setForm] = useState(() => ({
    name: data?.name || '',
    contacts: data?.contacts || '',
    skill_level: data?.skill_level || '',
    city: data?.city || '',
    state: data?.state || '',
    country: data?.country || '',
    dob: data?.dob ? new Date(data.dob).toISOString().slice(0,10) : '',
  }))
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  function updateField(k, v) {
    setForm((s) => ({ ...s, [k]: v }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setMsg('')
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setMsg('Saved')
    } catch (err) {
      setMsg(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          className="w-full rounded border p-2"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
      </div>

      {role === 'student' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Skill Level</label>
            <input
              className="w-full rounded border p-2"
              value={form.skill_level}
              onChange={(e) => updateField('skill_level', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              className="w-full rounded border p-2"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input
              className="w-full rounded border p-2"
              value={form.state}
              onChange={(e) => updateField('state', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              className="w-full rounded border p-2"
              value={form.country}
              onChange={(e) => updateField('country', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">DOB</label>
            <input
              type="date"
              className="w-full rounded border p-2"
              value={form.dob}
              onChange={(e) => updateField('dob', e.target.value)}
            />
          </div>
        </>
      )}

      {role === 'instructor' && (
        <div>
          <label className="block text-sm font-medium mb-1">Contacts</label>
          <input
            className="w-full rounded border p-2"
            value={form.contacts}
            onChange={(e) => updateField('contacts', e.target.value)}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <button type="submit" disabled={saving} className="px-3 py-2 rounded bg-primary text-white">
          {saving ? 'Saving...' : 'Save'}
        </button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </form>
  )
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useRooms } from '@/context/RoomContext';
import { formatDateTime } from '@/lib/utils';
import { FileText, User, Phone, Mail, Calendar, CheckCircle2, XCircle, Clock, Plus, Loader2, RefreshCw } from 'lucide-react';

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  pending_review: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  assigned: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  completed: { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
};

export default function RequestsPage() {
  const { rooms } = useRooms();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Request Form State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [numGuests, setNumGuests] = useState(1);
  const [preferredType, setPreferredType] = useState('non_ac');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [purpose, setPurpose] = useState('Devotee Visit');
  const [notes, setNotes] = useState('');

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/requests', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.requests)) {
        setRequests(json.requests);
      }
    } catch (err) {
      console.error('Failed to load accommodation requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: guestName.trim(),
          guest_phone: guestPhone.trim() || undefined,
          guest_email: guestEmail.trim() || undefined,
          num_guests: numGuests,
          preferred_room_type: preferredType,
          preferred_checkin: checkInDate ? new Date(checkInDate).toISOString() : new Date().toISOString(),
          preferred_checkout: checkOutDate ? new Date(checkOutDate).toISOString() : undefined,
          purpose,
          notes,
          source: 'manual',
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowNewModal(false);
        setGuestName('');
        setGuestPhone('');
        setGuestEmail('');
        setNotes('');
        setFeedback('Request submitted and saved to Supabase (accommodation_requests table)!');
        fetchRequests();
      } else {
        alert(json.error || 'Failed to create request');
      }
    } catch (err: any) {
      alert(err.message || 'Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header rooms={rooms} />
        <main className="flex-1 p-4 md:p-6 space-y-4 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Guest Accommodation Requests</h2>
              <p className="text-sm text-gray-500">
                Stored in dedicated Supabase table (`accommodation_requests`) · Zoho Forms integration ready
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchRequests}
                disabled={isLoading}
                className="action-btn text-xs px-3 py-2"
                title="Refresh from Supabase"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>
              <button
                onClick={() => setShowNewModal(true)}
                className="action-btn primary text-xs px-3 py-2 flex items-center gap-1.5"
              >
                <Plus size={14} />
                New Request
              </button>
            </div>
          </div>

          {feedback && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-lg flex items-center justify-between">
              <span>{feedback}</span>
              <button onClick={() => setFeedback(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
            </div>
          )}

          <div className="bg-stone-100 border border-stone-200 rounded-lg p-3 text-xs text-stone-700 flex items-center gap-2">
            <span className="font-semibold text-stone-900">Architecture Note:</span>
            <span>
              Incoming booking and online requests are recorded in the <strong>accommodation_requests</strong> table.
              Manual check-ins for guests directly residing in rooms are stored separately in <strong>guests</strong> and <strong>stays</strong> linked to <strong>rooms</strong>.
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Guests</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room Type</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-in</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((req) => {
                  const sc = statusColors[req.status] || statusColors.new;
                  return (
                    <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            {req.guest_name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-gray-900">{req.guest_name}</span>
                            {req.purpose && <p className="text-[11px] text-gray-400">{req.purpose}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {req.guest_phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={11} className="text-gray-400" />
                            {req.guest_phone}
                          </div>
                        )}
                        {req.guest_email && (
                          <div className="flex items-center gap-1 text-gray-400">
                            <Mail size={11} />
                            {req.guest_email}
                          </div>
                        )}
                        {!req.guest_phone && !req.guest_email && <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-gray-700">{req.num_guests} person(s)</td>
                      <td className="px-4 py-3 text-xs uppercase font-medium text-gray-600">{req.preferred_room_type || 'non_ac'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{formatDateTime(req.preferred_checkin)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${sc.bg} ${sc.text} ${sc.border}`}>
                          {req.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <select
                          value={req.status}
                          onChange={(e) => handleStatusChange(req.id, e.target.value)}
                          className="px-2 py-1 bg-white border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="new">New</option>
                          <option value="pending_review">Pending Review</option>
                          <option value="approved">Approved</option>
                          <option value="assigned">Assigned</option>
                          <option value="rejected">Rejected</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {requests.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                      No accommodation requests yet in Supabase. Click <strong>+ New Request</strong> to create one or connect Zoho Forms webhook.
                    </td>
                  </tr>
                )}
                {isLoading && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                      <Loader2 size={18} className="animate-spin inline-block mr-2" />
                      Loading requests from Supabase database...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* New Request Modal */}
          {showNewModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="text-base font-bold text-gray-900">New Accommodation Request</h3>
                  <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600">×</button>
                </div>

                <form onSubmit={handleCreateRequest} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Guest Full Name *</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="e.g. Anand Kumar"
                      className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Phone</label>
                      <input
                        type="text"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Email</label>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="guest@example.com"
                        className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Guests Count</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={numGuests}
                        onChange={(e) => setNumGuests(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Preferred Room</label>
                      <select
                        value={preferredType}
                        onChange={(e) => setPreferredType(e.target.value)}
                        className="w-full px-3 py-2 text-xs border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="non_ac">Non-AC Room</option>
                        <option value="ac">AC Room</option>
                        <option value="dormitory">Dormitory</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Preferred Check-in</label>
                      <input
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">Preferred Check-out</label>
                      <input
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Purpose / Notes</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special requirements, devotee group, etc."
                      className="w-full px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    <button
                      type="submit"
                      disabled={isSubmitting || !guestName.trim()}
                      className="action-btn primary text-xs flex-1 justify-center py-2"
                    >
                      {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
                      Save to accommodation_requests
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewModal(false)}
                      className="action-btn text-xs px-3 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

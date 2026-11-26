import { invite } from '../invite';

// The guest's name comes from the invitation link (?guest=Sharma+Family); with none in the link, invite.guest is
// used, and if that is empty the invitation addresses everyone.
const fromLink = () => (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('guest')?.trim()) || '';
const named = () => fromLink() || invite.guest?.trim() || '';

export const guestName = () => named() || 'Family & Friends';

// true when there is a guest to address by name
export const hasGuestName = () => !!named();

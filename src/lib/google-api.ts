import { createClient } from '@/utils/supabase/client';

export async function getGoogleProviderToken(): Promise<string | null> {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    // Note: provider_token is only available if access_type is set and scopes are requested during sign in
    return session?.provider_token || null;
}

// ─── Google Contacts ──────────────────────────────────────────────────────────

export interface GoogleContact {
    resourceName: string;
    names?: { displayName: string }[];
    emailAddresses?: { value: string }[];
    organizations?: { name: string, title: string }[];
    phoneNumbers?: { value: string }[];
}

export async function fetchGoogleContacts(token: string): Promise<GoogleContact[]> {
    try {
        const res = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,organizations,phoneNumbers&pageSize=100', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error(`Google API Error: ${res.status}`);
        }

        const data = await res.json();
        return data.connections || [];
    } catch (error) {
        console.error('Error fetching Google Contacts:', error);
        return [];
    }
}

// ─── Google Calendar ──────────────────────────────────────────────────────────

export interface GoogleCalendarEvent {
    id: string;
    summary: string;
    description?: string;
    start: { dateTime?: string; date?: string };
    end: { dateTime?: string; date?: string };
    htmlLink: string;
}

export async function fetchGoogleCalendarEvents(token: string, timeMin: Date, timeMax: Date): Promise<GoogleCalendarEvent[]> {
    try {
        const query = new URLSearchParams({
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: 'true',
            orderBy: 'startTime',
        });

        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${query.toString()}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error(`Google API Error: ${res.status}`);
        }

        const data = await res.json();
        return data.items || [];
    } catch (error) {
        console.error('Error fetching Google Calendar Events:', error);
        return [];
    }
}

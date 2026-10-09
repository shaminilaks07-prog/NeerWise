import type { AppAction, AppState } from '../types/state';

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.profile };
    case 'SET_BUDGET':
      return { ...state, budget: action.budget };

    case 'UPSERT_DAILY': {
      // A manual daily total replaces any record for that date. Sample hourly rows for the
      // date are dropped because they would no longer add up to the new total.
      const daily = state.daily.filter((d) => d.date !== action.record.date);
      daily.push(action.record);
      daily.sort((a, b) => (a.date < b.date ? -1 : 1));
      return { ...state, daily, hourly: state.hourly.filter((h) => h.date !== action.record.date) };
    }
    case 'DELETE_DAILY':
      return {
        ...state,
        daily: state.daily.filter((d) => d.date !== action.date),
        hourly: state.hourly.filter((h) => h.date !== action.date),
      };

    case 'SET_ALERT':
      return { ...state, alertStatus: { ...state.alertStatus, [action.id]: { decision: action.decision, at: action.at } } };
    case 'CLEAR_ALERT': {
      const next = { ...state.alertStatus };
      delete next[action.id];
      return { ...state, alertStatus: next };
    }

    case 'LOAD_SAMPLE':
      return { ...state, daily: action.daily, hourly: action.hourly, alertStatus: {} };
    case 'CLEAR_USAGE':
      return { ...state, daily: [], hourly: [], alertStatus: {} };
    case 'RESET_ALL':
      return action.state;

    case 'SET_GOAL':
      return { ...state, challenge: { ...state.challenge, goalLitres: action.litres } };
    case 'ADD_MEMBER':
      return { ...state, challenge: { ...state.challenge, members: [...state.challenge.members, action.member] } };
    case 'REMOVE_MEMBER':
      if (state.challenge.members.length <= 1) return state;
      return {
        ...state,
        challenge: {
          ...state.challenge,
          members: state.challenge.members.filter((m) => m.id !== action.id),
          logs: state.challenge.logs.filter((l) => l.memberId !== action.id),
        },
      };
    case 'ADD_LOG':
      return { ...state, challenge: { ...state.challenge, logs: [...state.challenge.logs, action.log] } };
    case 'DELETE_LOG':
      return { ...state, challenge: { ...state.challenge, logs: state.challenge.logs.filter((l) => l.id !== action.id) } };

    default:
      return state;
  }
}

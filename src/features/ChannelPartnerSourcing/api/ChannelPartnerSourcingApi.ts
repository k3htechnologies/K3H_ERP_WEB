export const ChannelPartnerSourcingApi = {
  PULL: '/ChannelPartnerSourcing/PullChannelPartnerSourcing',
  ADD_UPDATE: '/ChannelPartnerSourcing/AddUpdateChannelPartnerSourcing',
  DELETE: '/ChannelPartnerSourcing/DeleteChannelPartnerSourcing'
} as const;

export type ChannelPartnerSourcingApiKeys = keyof typeof ChannelPartnerSourcingApi;



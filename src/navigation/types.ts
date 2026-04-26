export type RootStackParamList = {
  Main: undefined;
  Landing: undefined;
  Search: undefined;
  SearchMain: undefined;
  Map: { daycares: any[]; lat?: number; lng?: number };
  DaycareDetail: { id: string };
  Favorites: undefined;
  ProviderLogin: undefined;
  ProviderRegister: undefined;
  ProviderDashboard: undefined;
  ClaimDaycare: undefined;
  EditListing: { id: string };
  AdminDashboard: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Favorites: undefined;
  Dashboard: undefined;
  Admin: undefined;
};

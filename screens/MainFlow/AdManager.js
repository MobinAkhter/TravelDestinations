import { InterstitialAd, AdEventType } from "react-native-google-mobile-ads";

const interstitialAdUnitId = "ca-app-pub-1134256608400195/5476614344"; // Your Interstitial Ad unit ID

let interstitialAd;

export const loadInterstitialAd = () => {
  interstitialAd = InterstitialAd.createForAdRequest(interstitialAdUnitId);
  let loaded = false;

  const unsubscribeLoaded = interstitialAd.addAdEventListener(
    AdEventType.LOADED,
    () => {
      loaded = true;
    }
  );

  interstitialAd.load();

  return {
    showAdIfLoaded: () => {
      if (loaded) {
        interstitialAd.show();
      }
    },
    unsubscribe: () => {
      unsubscribeLoaded();
    },
  };
};

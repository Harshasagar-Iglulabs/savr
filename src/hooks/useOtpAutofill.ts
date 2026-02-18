import {useEffect} from 'react';
import {autoFillOtp} from '../services/auth';

export function useOtpAutofill(enabled: boolean, onAutoFill: (otp: string) => void) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;

    autoFillOtp().then(code => {
      if (active) {
        onAutoFill(code);
      }
    });

    return () => {
      active = false;
    };
  }, [enabled, onAutoFill]);
}

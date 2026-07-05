import { useState, useCallback, useEffect } from 'react';
import type { CompanySettings, CarrierSettings } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const defaultCompany: CompanySettings = {
  companyName: '',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  paymentInstructions: '',
  zelle: '',
  payoneer: '',
  bankInformation: '',
  dispatchPercentage: 10,
  invoiceTemplateId: 'blue-professional',
};

const defaultCarrier: CarrierSettings = {
  carrierName: '',
  carrierAddress: '',
  mcNumber: '',
  carrierPhone: '',
};

export function useSettings() {
  const { user } = useAuth();
  const [company, setCompanyState] = useState<CompanySettings>(defaultCompany);
  const [carrier, setCarrierState] = useState<CarrierSettings>(defaultCarrier);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCompanyState(defaultCompany);
      setCarrierState(defaultCarrier);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('user_settings').select('company, carrier').eq('user_id', user.id).single();
      if (data) {
        setCompanyState({ ...defaultCompany, ...(data.company as CompanySettings) });
        setCarrierState({ ...defaultCarrier, ...(data.carrier as CarrierSettings) });
      }
      setLoading(false);
    })();
  }, [user]);

  const persist = useCallback(async (comp: CompanySettings, carr: CarrierSettings) => {
    if (!user) return;
    await supabase.from('user_settings').upsert({
      user_id: user.id,
      company: comp,
      carrier: carr,
      updated_at: new Date().toISOString(),
    });
  }, [user]);

  const saveCompany = useCallback(async (settings: CompanySettings) => {
    setCompanyState(settings);
    await persist(settings, carrier);
  }, [carrier, persist]);

  const saveCarrier = useCallback(async (settings: CarrierSettings) => {
    setCarrierState(settings);
    await persist(company, settings);
  }, [company, persist]);

  const saveAll = useCallback(async (comp: CompanySettings, carr: CarrierSettings) => {
    setCompanyState(comp);
    setCarrierState(carr);
    await persist(comp, carr);
  }, [persist]);

  return { company, carrier, loading, saveCompany, saveCarrier, saveAll };
}

import { Router } from 'express';
import { supabase } from '../../lib/supabase';

const router = Router();

router.post('/logout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    // Clear any session cookies if you're using them
    res.clearCookie('session');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router; 
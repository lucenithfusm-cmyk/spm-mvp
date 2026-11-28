'use strict';
// One canonical policy; ship an exact browser copy outside the excluded backend tree.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'../..');
fs.copyFileSync(path.join(root,'supabase/functions/_shared/assessment-policy.js'),path.join(root,'premium-v2/assessment-policy.js'));

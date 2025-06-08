# Deployment Checklist - RPC Migration to QuickNode

## 🎯 **Objective**
Migrate from Alchemy public RPC to QuickNode to resolve withdrawal transaction failures.

## ✅ **Pre-Deployment Checklist**

### **Code Changes**
- [ ] ✅ Updated `src/utils/constants.ts` with QuickNode RPC URL
- [ ] ✅ Updated `src/utils/switchToWorldChain.ts` RPC references
- [ ] ✅ Updated `netlify.toml` with `VITE_WORLDCHAIN_RPC_URL` environment variables
- [ ] ✅ Updated README.md with troubleshooting section
- [ ] ✅ No hardcoded Alchemy RPC URLs remaining (`grep -r "alchemy.com.*public"`)

### **Environment Variables**
- [ ] ✅ `VITE_WORLDCHAIN_RPC_URL` added to all Netlify deployment contexts:
  - [ ] ✅ Production
  - [ ] ✅ Staging  
  - [ ] ✅ Development
  - [ ] ✅ v3-mockup

### **Configuration Verification**
- [ ] ✅ All transaction confirmation hooks use `WORLDCHAIN_RPC_URL` constant:
  - [ ] ✅ `useRequestLoan.tsx`
  - [ ] ✅ `useRepayLoan.tsx`
  - [ ] ✅ `useRepayDefaultedLoan.ts`
  - [ ] ✅ `useDefaultedLegacyLoan.ts`
  - [ ] ✅ `v1LoanRequests.ts`

## 🚀 **Deployment Steps**

### **1. Staging Deployment**
- [ ] Deploy to staging environment
- [ ] Test withdrawal functionality with small amounts
- [ ] Verify no "Internal JSON-RPC error" messages
- [ ] Check browser console for RPC-related errors

### **2. Production Deployment**
- [ ] Deploy to production environment
- [ ] Monitor withdrawal success rates
- [ ] Set up alerts for RPC-related errors
- [ ] Verify Sentry error tracking

## 🧪 **Post-Deployment Testing**

### **Critical Functions to Test**
- [ ] Pool withdrawals (LP token redemption)
- [ ] Loan applications
- [ ] Loan repayments
- [ ] NFT verification transactions
- [ ] Network switching functionality

### **Test Cases**
1. **Withdrawal Flow Test**:
   - [ ] Connect wallet to World Chain
   - [ ] Navigate to lending pools
   - [ ] Attempt withdrawal from active position
   - [ ] Verify successful transaction without RPC errors

2. **Cross-Component RPC Consistency**:
   - [ ] Verify frontend uses QuickNode RPC
   - [ ] Confirm backend uses QuickNode RPC
   - [ ] Check transaction confirmations work properly

## 📊 **Monitoring & Success Metrics**

### **Key Metrics to Track**
- [ ] Withdrawal transaction success rate (target: >95%)
- [ ] Reduction in "Internal JSON-RPC error" incidents
- [ ] Average transaction confirmation time
- [ ] User-reported issues (should decrease)

### **Monitoring Tools**
- [ ] Sentry for error tracking
- [ ] Netlify deployment logs
- [ ] User feedback channels

## 🔧 **Rollback Plan**

If issues arise:
1. **Immediate Rollback**: Revert `constants.ts` to use Alchemy RPC
2. **Partial Rollback**: Update specific components causing issues
3. **Environment-Specific**: Rollback staging first, then production

### **Rollback Commands**
```bash
# Quick revert to Alchemy (if needed)
export const WORLDCHAIN_RPC_URL = "https://worldchain-mainnet.g.alchemy.com/public";
```

## 📋 **Post-Migration Tasks**

### **Week 1**
- [ ] Monitor withdrawal success rates daily
- [ ] Collect user feedback
- [ ] Document any remaining issues

### **Week 2**
- [ ] Review error logs for patterns
- [ ] Optimize RPC usage if needed
- [ ] Update documentation based on learnings

### **Month 1**
- [ ] Conduct post-mortem review
- [ ] Update incident response procedures
- [ ] Plan backend RPC migration if needed

## 🔍 **Known Issues & Solutions**

### **Issue**: Metamask Network Mismatch
**Solution**: Ensure `switchToWorldChain.ts` uses QuickNode RPC

### **Issue**: Transaction Pending Forever
**Solution**: Check RPC consistency between frontend and backend

### **Issue**: Rate Limiting
**Solution**: Monitor QuickNode usage and upgrade plan if needed

---

**Migration Date**: December 2024  
**Contact**: ty@siestamarkets.com  
**Status**: ✅ Complete 
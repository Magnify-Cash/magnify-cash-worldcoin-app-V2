# 🔍 Withdrawal Debug Guide

## Overview
We've added comprehensive logging to debug the "successful toast but failing transaction" issue. Follow this guide to interpret the logs and identify the root cause.

---

## 🚨 **CRITICAL: How to Test**

1. **Open Browser Developer Console** (F12 → Console tab)
2. **Attempt a withdrawal** that previously showed "successful toast" but failed
3. **Look for logs starting with `[WITHDRAWAL DEBUG]`**
4. **Follow the analysis guide below**

---

## 📊 **Log Analysis Guide**

### **Phase 1: Pre-Transaction Validation**
```
[WITHDRAWAL DEBUG] Pre-calculation values: { ... }
[WITHDRAWAL DEBUG] Final calculation values: { ... }
```

**Look for:**
- ❌ `estimatedLpAmount: 0` or negative values → **LP calculation error**
- ❌ `lpTokenAmountWithDecimals: "0"` → **Decimal conversion issue**
- ❌ `estimatedLpAmount > lpBalance` → **Insufficient LP balance**

### **Phase 2: Gas Estimation**
```
[WITHDRAWAL DEBUG] Estimating gas...
[WITHDRAWAL DEBUG] Gas estimate: 123456
```

**Look for:**
- ❌ `Gas estimation failed:` → **Transaction will definitely fail**
- ❌ Gas estimate unusually high (>500,000) → **Contract issue**
- ✅ Normal gas estimate (50,000-200,000) → **Gas OK**

### **Phase 3: Transaction Submission**
```
[WITHDRAWAL DEBUG] Transaction submitted, hash: 0x...
```

**Look for:**
- ❌ No hash logged → **Transaction never submitted**
- ✅ Hash present → **Transaction submitted successfully**

### **Phase 4: Transaction Confirmation**
```
[WITHDRAWAL DEBUG] Transaction receipt: { status: "success", ... }
[WITHDRAWAL DEBUG] Transaction successful, showing toast
```

**Look for:**
- ❌ `status: "reverted"` → **Contract rejected transaction**
- ❌ No receipt logged → **Transaction stuck/timeout**
- ✅ `status: "success"` → **Transaction actually succeeded**

### **Phase 5: Error Analysis**
```
[WITHDRAWAL DEBUG] Withdraw error: { ... }
[WITHDRAWAL DEBUG] Error details: { message, code, reason, ... }
[WITHDRAWAL DEBUG] Error classification: { isRpcError, isContractRevert, ... }
```

---

## 🎯 **Expected Scenarios & Solutions**

### **Scenario A: Toast Success + Transaction Success**
**Logs show:** `status: "success"` + `Transaction successful, showing toast`  
**Problem:** User thinks it failed but it actually worked  
**Solution:** Check if user's balance updated, might be UI refresh issue

### **Scenario B: Toast Success + Contract Revert**
**Logs show:** `status: "reverted"` or gas estimation fails  
**Problem:** Contract rejecting transaction due to business logic  
**Solution:** Check contract conditions (liquidity, slippage, etc.)

### **Scenario C: Toast Success + Network Issues**
**Logs show:** RPC errors or timeouts  
**Problem:** Network/RPC inconsistency despite our fixes  
**Solution:** Additional RPC endpoint validation needed

### **Scenario D: Toast Success + LP Calculation Error**
**Logs show:** Invalid LP amounts in pre-calculation  
**Problem:** Frontend calculating wrong LP token amounts  
**Solution:** Fix LP token calculation logic

---

## 🔧 **Common Issues & Quick Fixes**

### **Issue 1: Gas Estimation Fails**
```
Gas estimation failed: execution reverted
```
**Cause:** Contract will reject transaction  
**Fix:** Check pool liquidity, withdrawal limits, user balance

### **Issue 2: LP Amount Calculation Error**
```
estimatedLpAmount: 0 or NaN
```
**Cause:** Exchange rate calculation failure  
**Fix:** Review `calculateLpTokenAmount()` function

### **Issue 3: RPC Timeout**
```
No transaction receipt after 60 seconds
```
**Cause:** Network congestion or RPC issues  
**Fix:** Verify QuickNode RPC endpoint health

### **Issue 4: Contract Revert**
```
status: "reverted"
```
**Cause:** Smart contract business logic rejection  
**Fix:** Check contract state, pool status, user permissions

---

## 📝 **Next Steps After Testing**

1. **Identify the exact failure point** using the logs
2. **Report findings** with specific log output
3. **Implement targeted fix** based on root cause
4. **Remove debug logs** after issue is resolved

---

## 🚨 **Security Note**
The debug logs contain transaction details but no sensitive information (private keys, etc.). Safe for testing in production.

---

*Run the withdrawal flow and check console logs to identify the exact issue!* 
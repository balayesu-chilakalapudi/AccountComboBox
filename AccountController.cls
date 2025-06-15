public with sharing class AccountController {
    @AuraEnabled(cacheable=true)
    public static list<Account> getAccountRecords(){
        try {
            return [select id, name from Account limit 100];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static String saveAccountOnCase(String selecteAccounts,Case caseObj){
        try{           
            caseObj.recordTypeId = Schema.getGlobalDescribe()
                .get('Case')
                .getDescribe()
                .getRecordTypeInfosByName()
                .get('Support Request')
                .getRecordTypeId();           
            insert caseObj;
            List<Account_Case__c> acList=new List<Account_Case__c>();
            set<Id> accountIds=new set<Id>();
            for(String accId:selecteAccounts.split(',')){
                accountIds.add(accId);
            }
            Map<Id,Account> accountMap=new Map<Id,Account>([select id,name from account where Id IN:accountIds]);
            for(String accountId:selecteAccounts.split(',')){
                acList.add(new Account_Case__c(Case__c=caseObj.Id,Account__c=accountId));
            }
            insert acList;
            return caseObj.Id;
        }catch(Exception ex){
            throw new AuraHandledException(ex+'\n'+ex.getStackTraceString());
        }
    }
}
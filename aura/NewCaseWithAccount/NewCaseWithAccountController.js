({
    openModal: function(component, event, helper) {
        component.set("v.isOpen", true);
    },
    
    closeModal: function(component, event, helper) {
        
        /* var navEvent = $A.get("e.force:navigateToURL");
        navEvent.setParams({
            "url": "/lightning/o/Case/list?filterName=Recent"
        });
        navEvent.fire();*/
        window.open('/lightning/o/Case/list?filterName=Recent','_self');
        component.set("v.isOpen", false);
    },
    saveLwcData:function(component,event,helper){
        component.find('acclWCComponent').handleSubmit();   
    },
    saveChanges: function(component, event, helper) {
        // Perform your logic here
        // alert('Changes Saved!');
        //component.set("v.isOpen", false);
        var navEvent = $A.get("e.force:navigateToURL");
        navEvent.setParams({
            "url": "/lightning/o/Case/list?filterName=Recent"
        });
        navEvent.fire();
    },
    
    editsavehandler: function(component, event, helper) {
        component.set("v.isOpen",false);
        console.log('editsavehandler');
        let selectedAccountIds=event.getParam('selectedAccountIds');
        component.set("v.selectedAccountIds",selectedAccountIds);
        component.set("v.isOpenCaseModel", true);
        /* var editRecordEvent = $A.get("e.force:editRecord");
        editRecordEvent.setParams({
            "recordId": caseId
        });
        editRecordEvent.fire();*/
        
        /*
        var navEvent = $A.get("e.force:navigateToURL");
        navEvent.setParams({
            "url": "/"+caseId
        });
        navEvent.fire();*/
    },
    closeCaseModal: function(component, event, helper) {        
        /* let caseId=component.get("v.recordId");*/
        window.open('/lightning/o/Case/list?filterName=Recent','_self');
        component.set("v.isOpenCaseModel", false);
    },
    handleSuccess : function(component, event, helper) {
        var payload = event.getParams().response;
        var caseId = payload.id;
        component.set("v.recordId", caseId);
        
        // Navigate to Case detail view after creation
        /*  var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
            "recordId": caseId,
            "slideDevName": "detail"
        });
        navEvt.fire();*/
        component.set("v.isOpenCaseModel", false);
        window.open('/'+caseId,'_self');
    },
    
    handleError : function(component, event, helper) {
        console.error('Error creating case: ', event.getParams());
    }, 
    
   
    saveCaseData:function(component,event,helper){
        console.log('saveCaseData=======');
        try{
            let selectedAccountIds=component.get("v.selectedAccountIds");
            let caseObj=component.get("v.caseObj");
            if(helper.handleInputValidation(component,event)){
                var action = component.get("c.saveAccountOnCase");
                let params={ selecteAccounts: selectedAccountIds,
                            caseObj:caseObj };
                console.log('params:'+JSON.stringify(params));
                action.setParams(params);
                action.setCallback(this, function(response) {
                    var state = response.getState();
                    if (state === "SUCCESS") {
                        let caseId=response.getReturnValue();
                        component.set("v.caseId", caseId);
                        window.open('/'+caseId,'_self');
                    } else {
                        console.error("Error: " + response.getError());
                    }
                });            
                $A.enqueueAction(action);  
            }else{
                 var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": "Warning",
            "message": "Please fill required fields.",
            "type": "warning"
        });
        toastEvent.fire();
            }
        }catch(err){
            console.log(err.stack);
        }
    }
})

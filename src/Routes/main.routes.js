const {Router} = require("express");
const initAdminController = require("./controller/admin.controller");
const router = Router();
const {customValidation , tokenVerification, CONSTANTS} = require("@lucideld/bse-common-services")
const { createGroupValidator, editGroupValidator, deleteGroupValidator , groupConflictValidator , getAllEldEventsValidator , getCompaniesValidator, createCompanyValidator, createSystemUser, getAllVehicleQueryValidator, companyListValidator, violationWarningQueryValidator} = require("./admin.validator");

const initMainRoutes = () => {
    const {createGroup , editGroup , deleteGroup , getAllGroups , groupConflictCnt , getAllPlans , getCompanies, changePlanAdmin , getAllSubscriptionDetails , getFMCSATransferLogsSystem , createCompany , createUserBySystem, getSystemUsersList, deleteUserFeedBackInfoData , getUserFeedBackInfoData , getCompaniesList, getDropdownCompanies, getAllSystemUsers, generatesubscriptionPdf, getViolationsAndWarnings} = initAdminController();
    router.route("/getAllGroups").get([customValidation(getAllEldEventsValidator, "query"), tokenVerification(CONSTANTS.ROLES.SYSTEM_SALES_AND_SUPER_ADMIN_AND_SYSTEM_ADMINISTRATOR  )], getAllGroups)
    router.route("/addGroup").post([tokenVerification(CONSTANTS.ROLES.SYSTEM_SUPER_ADMIN), customValidation(createGroupValidator, "body")], createGroup);
    router.route("/editGroup").post([tokenVerification(CONSTANTS.ROLES.SYSTEM_SUPER_ADMIN), customValidation(editGroupValidator , "body")], editGroup)
    router.route("/deleteGroup").delete([tokenVerification(CONSTANTS.ROLES.SYSTEM_SUPER_ADMIN), customValidation(deleteGroupValidator, "query")] , deleteGroup)
    router.route("/groupConflict").post([customValidation(groupConflictValidator , "body") , tokenVerification(CONSTANTS.ROLES.SYSTEM_SUPER_ADMIN)] , groupConflictCnt)
    router.route("/listAllPlans").get(tokenVerification(CONSTANTS.ROLES.SYSTEM_SALES_AND_SUPER_ADMIN) , getAllPlans);
    router.route("/getCompanies").get([tokenVerification(CONSTANTS.ROLES.SYSTEM_SALES_AND_SUPER_ADMIN), customValidation(getCompaniesValidator, "query")], getCompanies);
    router.route("/changePlan").post(tokenVerification(CONSTANTS.ROLES.SYSTEM_SALES_AND_SUPER_ADMIN), changePlanAdmin)
    router.route("/allSubscriptionDetails").get(getAllSubscriptionDetails);
    router.route("/getFMCSATransferLogs").get(tokenVerification(), getFMCSATransferLogsSystem)
    router.route("/createCompanyBySystem").post(customValidation(createCompanyValidator, "body"),[tokenVerification(CONSTANTS.ROLES.SYSTEM_ADMINISTRATOR_AND_SUPER_ADMIN_AND_TECHNICIAN)],createCompany);
    router.route("/manage/system-user").post([tokenVerification(CONSTANTS.ROLES.SYSTEM_ADMINISTRATOR_AND_SUPER_ADMIN), customValidation(createSystemUser, "body")], createUserBySystem)
    router.route("/getSystemUsers").get([customValidation(getAllVehicleQueryValidator, "query"), tokenVerification(CONSTANTS.ROLES.SYSTEM_ADMINISTRATOR_AND_SUPER_ADMIN)], getSystemUsersList);
    router.route("/deleteUserFeedBackInfo").post(tokenVerification(), deleteUserFeedBackInfoData)
    router.route("/getUserFeedBackInfo").get(tokenVerification(), getUserFeedBackInfoData);
    router.route("/companiesList").get([tokenVerification(CONSTANTS.ROLES.SYSTEM_ADMINISTRATOR_AND_SUPER_ADMIN_AND_TECHNICIAN), customValidation(companyListValidator, "query")], getCompaniesList);
    router.route("/").get((req ,res) => res.send({message : "Admin service is running inside admin routess!!!"}))
    router.route("/companies").get(tokenVerification(), getDropdownCompanies);
    router.route("/generatesubscriptionPdf").get(tokenVerification() , generatesubscriptionPdf)
    router.route("/systemUsers").get(tokenVerification() , getAllSystemUsers)
    // To fetch the all warnings and violations with respect to companies
    router.route("/companies-violations").get([customValidation(violationWarningQueryValidator, "query"), tokenVerification(CONSTANTS.ROLES.SYSTEM_ADMINISTRATOR_AND_SUPER_ADMIN)], getViolationsAndWarnings);
    return router;
}
module.exports = initMainRoutes;
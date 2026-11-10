const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'./tests',timeout:60000,workers:1,reporter:'list',use:{baseURL:'http://127.0.0.1:5173',viewport:{width:1440,height:900},channel:'msedge',headless:true},outputDir:'evidence/test-results'});

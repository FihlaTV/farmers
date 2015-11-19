var CONST = require('../constants/constants');
var RESPONSE = require('../constants/response');
var _ = require('lodash');
var csv = require('csv');
var fs = require('fs');
var async = require('async');

//var PlantsHelper = require("../helpers/plants");
//var ValidationHelper = require("../helpers/validation");


var Statistics = function (db) {
    'use strict';
    var MonthAveragePrice = db.model(CONST.MODELS.MONTH_AVERAGE_PRICE);
    var  cropListMerged = [];



   this.getMonthlyPrice = function (req, res, next) {


       var findOpts={}
       var findOrOpts = {}




       if ( !req.query.cropName ) {
           return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS});
       }
           findOpts.cropListName =  req.query.cropName;

       if (req.query.year ) {
           findOpts.year =  req.query.year;
       }
       if (req.query.month ) {
           findOpts.month =  req.query.month;
       }
       if(req.query.quality){
           findOrOpts={ '$or': [ { 'pcQuality': req.query.quality }, { 'wsQuality': req.query.quality }]};
           findOpts = {'$and':[findOpts,findOrOpts]}
       }
       MonthAveragePrice.find(
           findOpts
       ). exec(function (err, list) {

           if(err){
            return   res.status(500).send({error:err});
           }

           res.status(200).send(list);
       });

   };
    this.getPrice = function (req, res, next) {
        function sortPriceMonthDesc  (a, b) {
            if (a.avrPrice < b.avrPrice) {
                return 1;
            }
            if (a.avrPrice > b.avrPrice) {
                return -1;
            }
            return 0;
        }
        function createOutYearObj (list){
            var monthListPc = [];
            var monthListWs = [];
            var avrPrices= [];
            var outObj={}
            var prices;
            var totalPrice;
            for (var k = 0; k < 12; k++) {
                monthListWs[k] = [];
                monthListPc[k] = [];
            }
            for(var i = list.length -1; i >= 0; i--){
                if(list[i].site == CONST.PLANT_COUNCIL){
                    monthListPc[list[i].month].push(list[i])
                }
                if(list[i].site == CONST.WHOLE_SALE_MARKET){
                    monthListWs[list[i].month].push(list[i])
                }
            }

            for(var m = 11; m >= 0; m--){
                prices =[];
                totalPrice = 0;
                if(monthListWs[m].length > 0 ){
                    for(var l = monthListWs[m].length -1; l >= 0; l--){
                        prices.push(monthListWs[m][l].price)
                    }
                }
                if(monthListPc[m].length > 0){
                    for(var l = monthListPc[m].length -1; l >= 0; l--){
                        prices.push(monthListPc[m][l].price)
                    }
                }
                for(var s = prices.length -1; s >= 0; s--){
                    totalPrice += prices[s];
                }
                avrPrices.push({
                    month:m,
                    avrPrice:(totalPrice / prices.length)?(totalPrice / prices.length):0
                });
            }

            avrPrices = avrPrices.sort(sortPriceMonthDesc);

            if(avrPrices[0]){
                outObj = {
                    month:avrPrices[0].month,
                    pricePc:parseFloat((monthListPc[avrPrices[0].month][0])?monthListPc[avrPrices[0].month][0].price:0).toFixed(2),
                    priceWs:parseFloat((monthListWs[avrPrices[0].month][0])?monthListWs[avrPrices[0].month][0].price:0).toFixed(2),
                }
            }
            return outObj;
        }


        function getYearsStaisticRecursive (findOptsLocal,startYear,cb){
            var outList =[];


            function getYearStatisics(yearList,indexOfYear,localCb){
                var outObj;
                var month;
                var year = startYear + indexOfYear;
                if(findOptsLocal.cropListName) {
                    findOptsLocal.year = year;
                    month = findOptsLocal.month;
                }else{
                    findOptsLocal.$and[0].year = year;
                    month = findOptsLocal.$and[0].month;
                }

                MonthAveragePrice.find(
                        findOptsLocal
                ).exec(function (err, list) {
                        if(err){
                            return   cb(err,null);
                        }
                        outObj =  createOutYearObj(list)
                        outList.push({
                            year:year,
                            month: (month)?month:((outObj.month)?outObj.month:(outObj.month===0)?outObj.month:null),
                            pricePc:(outObj.pricePc)?outObj.pricePc:null,
                            priceWs:(outObj.priceWs)?outObj.priceWs:null,
                            priceMk:null,



                        });
                        indexOfYear++;
                        if(indexOfYear <3){
                            localCb(yearList,indexOfYear,getYearStatisics);
                        }else{
                            cb(null,outList);
                        }
            });
            }

            getYearStatisics(outList,0,getYearStatisics);
        }


        var findOpts={}

        var findOrOpts = {};


        if ( !req.query.cropName ) {
            return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS});
        }
        findOpts.cropListName =  req.query.cropName;

        if (req.query.year ) {
            findOpts.year =  parseInt(req.query.year);
        }
        if (req.query.month ) {
            findOpts.month =  parseInt(req.query.month);
        }
        if(!req.query.quality) {
            return res.status(400).send({error: RESPONSE.NOT_ENOUGH_PARAMS});
        }

        findOrOpts = {'$or': [{'pcQuality': req.query.quality}, {'wsQuality': req.query.quality}]};
        findOpts = {'$and': [findOpts, findOrOpts]};

            getYearsStaisticRecursive(findOpts,CONST.START_STATISTICS_YEAR,function(err,list){

                if(err){
                    return   res.status(500).send({error:err});
                }
                res.status(200).send(list);
            } );


    };


};

module.exports = Statistics;
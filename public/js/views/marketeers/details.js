define([],
    function () {
        var View = Backbone.View.extend({


            events:{

            },

            initialize:function(jsonModel){
                this.jsonModel=jsonModel;

            },

            onSave:function(args){

            },

            onCancel:function(){
                this.hideDialog();
            },

            hideDialog:function(){

            },


            removeMarketeerRow:function(marketeerId){

            },



            render:function(marketeer){

            }


        });

        return View;
    });
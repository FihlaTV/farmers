module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        jsdoc : {
            dist : {
                //src: ['handlers/!**!/!*.js', 'routes/**/*.js', 'models/**/*.js'],
               src: ['routes/users.js', 'routes/marketeers.js', 'routes/crops.js', 'routes/prices.js'],
                options: {
                    destination: 'public/apiDoc',
                    template : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
                    configure : "jsdoc.json"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('default', ['jsdoc']);
};
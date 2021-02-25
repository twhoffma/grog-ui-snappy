
module.exports = function(grunt) {
	//Initializing the configuration object
	grunt.initConfig({
		dirs: {
			outdir: '/var/www/glaze.hoffy.no/'
		},
	  // Task configuration
		handlebars: {
			all: {
				files: {
					'js/templates.js': 'templates/*.handlebars'
				}
			}
		},
		copy: {
  			main: {
    			files: [
      	  	  		// includes files within pat
      	  	  		{
										expand: true, 
										src: [
											'css/*', 
											'img/*', 
											'index.html'
										], 
										dest: '<%= dirs.outdir %>', 
										filter: 'isFile'
									},
      	  	  		{
										expand: true,
										flatten: true, 
										src: [
											'node_modules/bootstrap/dist/css/*',
											'node_modules/bootstrap-slider/dist/css/*',
											'node_modules/bootstrap-select/dist/css/bootstrap-select.min.css',
											'node_modules/nouislider/distribute/nouislider.min.css',
										], 
										dest: '<%= dirs.outdir %>/css/', 
										filter: 'isFile'
									},
      	  	  		{
										expand: true,
										flatten: true, 
										src: [
											'node_modules/bootstrap/dist/fonts/*', 
										], 
										dest: '<%= dirs.outdir %>/fonts/', 
										filter: 'isFile'
									},
									{
										expand: true,
										flatten: true,
										src: [
															'node_modules/handlebars/dist/handlebars.runtime.min.js',
															'node_modules/bootstrap/dist/js/bootstrap.js',
															'node_modules/jquery/dist/jquery.js',
															'node_modules/jquery/dist/core.js',
															'node_modules/bootstrap-select/dist/js/bootstrap-select.min.js',
															'node_modules/html5-history-api/history.min.js',
															'node_modules/nouislider/distribute/nouislider.min.js',
															'./js/data.js',
															'./js/ui.js',
															'./js/ui.slider.js',
															'./js/app.js',
															'./js/templates.js',
															'./js/sidenav_geeklists.js',
															'./js/header.js',
															'./js/graphs.js',
										],
										dest: '<%= dirs.outdir %>/js/',
										filter: 'isFile'
									}
      	  	  		// includes files within path and its sub-directories
      	  	  		//{expand: true, src: ['path/**'], dest: 'dest/'},

      	  	  		// makes all src relative to cwd
      	  	  		//{expand: true, cwd: 'path/', src: ['**'], dest: 'dest/'},

      	  	  		// flattens results to a single level
      	  	  		//{expand: true, flatten: true, src: ['path/**'], dest: 'dest/', filter: 'isFile'},
    				],
  	  		},
		},
		/*
    concat: {
			options: 
			{
      	separator: ';',
     	},
			'default':	{
        		src: [
							'node_modules/jquery/dist/jquery.js',
       			  'node_modules/bootstrap/dist/js/bootstrap.js',
        		],
        		dest: '<%= dirs.outdir %>/js/frontend.js'
      }
		},
		*/
    cssmin: {
			target: {
				files: [{
					expand: true,
      				cwd: 'public/css',
      				src: ['*.css', '!*.min.css'],
      				dest: 'public/css',
      				ext: '.min.css'
    			}],
  			},
		},
		less: {
			//...
		},
		uglify: {
			//...
		},
		phpunit: {
			//...
		},
		watch: {
			//...
		}
	});

	// Plugin loading
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-handlebars-compiler');
	//grunt.loadNpmTasks('grunt-contrib-watch');
	//grunt.loadNpmTasks('grunt-contrib-less');
	//grunt.loadNpmTasks('grunt-contrib-uglify');
  
	// Task definition
	grunt.registerTask('default', ['handlebars', 'copy']);
	grunt.registerTask('prod', ['handlebars', 'concat', 'copy', 'cssmin']);
};

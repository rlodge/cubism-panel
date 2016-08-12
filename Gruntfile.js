module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-contrib-clean');

  grunt.initConfig({

    clean: ["dist"],

    copy: {
      src_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['**/*', '!**/*.js', '!**/*.scss'],
        dest: 'dist'
      },
      img_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['img/*'],
        dest: 'dist/src/'
      },
      dep_to_dist: {
        cwd: 'node_modules',
        expand: true,
        src: ['d3/*','cubism/*'],
        dest: 'dist/'
      },
      cubism_overlay: {
        cwd: 'overlays/cubism',
        expand: true,
        src: ['*'],
        dest: 'dist/cubism'
      },
      pluginDef: {
        expand: true,
        src: [ 'plugin.json', 'README.md' ],
        dest: 'dist',
      }
    },

    watch: {
      rebuild_all: {
        files: ['src/**/*', 'plugin.json'],
        tasks: ['default'],
        options: {spawn: false}
      },
    },

    babel: {
      options: {
        sourceMap: true,
        presets:  ["es2015"],
        plugins: ['transform-es2015-modules-systemjs', "transform-es2015-for-of"],
      },
      dist: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ['*.js'],
          dest: 'dist',
          ext:'.js'
        }]
      },
    },
    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          "dist/css/cubism_dark.css": "src/sass/cubism_dark.scss",
          "dist/css/cubism_dark.css": "src/sass/cubism_dark.scss",
        }
      }
    }

  });

  grunt.registerTask('default', ['clean', 'sass', 'copy:src_to_dist', 'copy:img_to_dist', 'copy:dep_to_dist', 'copy:cubism_overlay', 'copy:pluginDef', 'babel']);
};

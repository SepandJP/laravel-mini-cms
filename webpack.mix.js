const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

   /********************/
  /* For TailwindCSS **/
 /********************/

// mix.js('resources/js/app.js', 'public/js').postCss('resources/css/app.css', 'public/css', [
//     require('postcss-import'),
//     require('tailwindcss'),
//     require('autoprefixer'),
// ]);


    /************************/
   /* For Bootstrap Theme **/
  /************************/

mix.scripts('resources/admin/assets/js/core/*.js', 'public/admin/js/core.js');
mix.scripts('resources/admin/assets/js/plugins/*.js', 'public/admin/js/plugins.js');
mix.js('resources/admin/assets/js/material-dashboard.min.js', 'public/admin/js/panel.js');

mix.styles([
    'resources/admin/assets/css/nucleo-icons.css',
    'resources/admin/assets/css/nucleo-svg.css',
], 'public/admin/css/nucleo.css');
mix.postCss('resources/admin/assets/css/material-dashboard.min.css', 'public/admin/css/panel.css');

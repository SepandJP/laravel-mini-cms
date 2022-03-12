        
        
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1 shrink-to-fit=no">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        @yield('meta')

        <link rel="apple-touch-icon" sizes="76x76" href="../admin/img/apple-icon.png">
        <link rel="icon" type="image/x-icon" href="{{asset('images/favicon.ico')}}">

        <title>{{ config('app.name')}} |@yield('title')</title>

        <!-- Google fonts-->
        <link href="https://fonts.googleapis.com/css?family=Lora:400,700,400italic,700italic" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800" rel="stylesheet" type="text/css" />

    
        <!-- Font Awesome Icons -->
        <script src="https://kit.fontawesome.com/42d5adcbca.js" crossorigin="anonymous"></script>
      
        <!-- Core theme CSS (includes Bootstrap)-->
        <link id="pagestyle" href="{{ asset('css/styles.css') }}" rel="stylesheet" />

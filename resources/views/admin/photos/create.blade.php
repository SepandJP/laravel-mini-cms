<x-app-layout>

    @section('title')
        {{ 'Upload Photo' }}
    @endsection

    @section('styles')
        <link rel="stylesheet" href="{{ asset('admin/css/dropzone.min.css') }}" type="text/css" />
    @endsection

    <x-slot name="header">
        <h2 class="text-xl text-gray-800">
            {{ __('Upload New Photo') }}
        </h2>
    </x-slot>

    <x-slot name="main">
            <section>
                <div class="container">
                    <div class="col-xl-8 col-lg-10 col-md-12  ms-auto me-auto ms-lg-auto me-lg-7 py-5">
                       
                                <x-auth-validation-errors>
                                </x-auth-validation-errors>
                                
                                <form class="dropzone" id="my-awesome-dropzone" role="form" method="POST" action="{{ route('photos.store') }}" accept-charset="UTF-8" enctype="multipart/form-data">
                                    @csrf

                                    <div class="fallback">
                                        <input name="file" type="file" multiple />
                                    </div>
                                </form>
                    </div>
                </div>
            </section>
    </x-slot>

    @section('scripts')
        <!-- Dropzone.js -->
        <script src="{{ asset('admin/js/dropzone.min.js') }}"></script>
    @endsection

</x-app-layout>
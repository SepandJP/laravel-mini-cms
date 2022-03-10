<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __('Photos') }}
        </h2>
    </x-slot>

    @section('title')
    {{ 'Photos' }}
    @endsection

    @section('styles')
        <link rel="stylesheet" href="{{ asset('admin/css/dropzone.min.css') }}" type="text/css" />
    @endsection

    <x-slot name="main">
            <div class="container-fluid py-4">
              <div class="row">
                <div class="col-12">
                  <div class="card my-4">
                    <div class="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                      <div class="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                        <h6 class="text-white text-capitalize ps-3">{{--{{ Auth::user()->name }}'s--}} Photos</h6>
                      </div>
                    </div>
                    <div class="mt-5 pt-5">

                          <x-auth-session-status class="alert-danger" :status="__('delete_photo')" >
                          </x-auth-session-status>

                    <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3 p-4">
                        @foreach ($photos as $photo)

                            <div class="col">
                                <div class="card shadow-sm h-100">
                                    <img class="bd-placeholder-img card-img-top" alt="{{ $photo->name }}" height="200px" src="{{$photo->path}}">
                  
                                    <div class="card-body text-center">
                                        <div class="h-50">
                                            <p>Uploaded by: <a href="#">{{ $photo->user->name }}</a></p>
                                        </div>
                                        <!-- Delete Post -->
                                        <div>
                                            <form role="form" method="POST" action="{{ route('photos.destroy', $photo->id) }}">
                                                @csrf
                                                @method('DELETE')
                                                <button class="btn btn-link btn-lg text-red me-auto border-0" data-bs-toggle="tooltip" data-bs-placement="top" title="Delete">
                                                    <span class="material-icons md-48">delete</span>
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        @endforeach
                    </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
    </x-slot>

    @section('scripts')
        <script>
            var win = navigator.platform.indexOf('Win') > -1;
            if (win && document.querySelector('#sidenav-scrollbar')) {
                var options = {
                    damping: '0.5'
                }
                Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
            }
        </script>

        <!-- Dropzon.js -->
        <script src="{{ asset('admin/js/dropzone.min.js') }}"></script>

    @endsection
</x-app-layout>

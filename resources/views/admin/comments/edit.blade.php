<x-app-layout>

    @section('title')
        {{ 'Edit Comment' }}
    @endsection

    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 leading-tight">
            {{ __("Edit Comment: $comment->id") }}
        </h2>
    </x-slot>

    <x-slot name="main">
            <section>
                <div class="page-header min-vh-100">
                <div class="container">
                    <div class="row">

                    <div class="col-xl-6 col-lg-7 col-md-9 d-flex flex-column ms-auto me-auto ms-lg-auto me-lg-7">
                       
                                <x-auth-validation-errors>
                                </x-auth-validation-errors>
                                
                                <form role="form" method="POST" action="{{ route('comments.update', $comment->id) }}">
                                    @csrf
                                    @method('PATCH')

                                    <x-label for="post" :value="__('Post')" />
                                    <!-- Post -->
                                    <x-field class="mb-3">
                                        <x-input id="post" type="text" name="post" :value="$comment->post->title" readonly/>
                                    </x-field>

                                    <!-- User -->
                                    <x-label for="user" :value="__('User')" />
                                    <x-field class="mb-3">
                                        <x-input id="user" type="text" name="user" :value="$comment->user->name" readonly/>
                                    </x-field>

                                    <!-- Description -->
                                    <x-label for="description" :value="__('Description')" />
                                    <div class="input-group input-group-outline">
                                        <textarea rows="20" class="form-control" id="description" type="textarea" name="description" required>
                                            {{$comment->description}}
                                        </textarea>
                                    </div>

                                    <div class="d-flex justify-content-center">
                                        <div class="text-center pt-0 px-lg-2 px-1">
                                            <div class="text-center pt-0 px-lg-2 px-1">
                                                <button class="btn bg-gradient-warning btn-lg btn-lg mt-4 mb-0">
                                                    {{ __('Edit') }}
                                                </button>
                                            </div>
                                        </div>
                                    </form>

                                    <!-- Delete Post -->
                                    <form role="form" method="POST" action="{{ route('comments.destroy', $comment->id) }}">
                                        @csrf
                                        @method('DELETE')

                                        <div class="pt-0 px-lg-2 px-1">
                                            <div class="text-center pt-0 px-lg-2 px-1">
                                                <button class="btn bg-gradient-danger btn-lg btn-lg mt-4 mb-0">
                                                    {{ __('Delete') }}
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                 </div>
                    </div>
                    </div>
                </div>
                </div>
            </section>
    </x-slot>

</x-app-layout>
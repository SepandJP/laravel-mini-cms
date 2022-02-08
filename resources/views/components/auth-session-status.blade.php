@props(['status'])

@if (Session::has($status))    
    <div {{ $attributes->merge(['class' => 'w-90 mx-auto alert alert-dismissible fade show']) }} role="alert">
        <span class="alert-icon align-middle">
        <span class="material-icons text-md">
        thumb_up_off_alt
        </span>
        </span>
        <span class="alert-text">{{session($status)}}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
@endif


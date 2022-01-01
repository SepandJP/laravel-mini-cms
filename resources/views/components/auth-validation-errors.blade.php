@props(['errors'])

@if ($errors->any())
<div class="mb-3">
    @foreach ($errors->all() as $error)
    <div class="alert alert-danger alert-dismissible text-white p-2 my-1" role="alert">
        <span class="text-sm">{{ $error }}</span>
        <button type="button" class="btn-close text-lg p-1 opacity-10" data-bs-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
        </button>
    </div>
    @endforeach
</div>
@endif

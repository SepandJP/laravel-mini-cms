<button {{ $attributes->merge(['type' => 'submit', 'class' => 'btn bg-gradient-primary w-100 ']) }}>
    {{ $slot }}
</button>

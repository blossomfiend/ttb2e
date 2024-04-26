<script>
    export let name;
    export let value;
</script>
<input type="text" data-dtype="Number" name={name} value={value} {...$$restProps} class={"ttb-number " + ($$restProps.class || "")}/>
<style>
    input.ttb-number {
        @apply w-full h-full text-center border-transparent bg-transparent p-0.5 leading-none
            hover:shadow-foundry hover:shadow-shadow-primary hover:bg-black/10
            disabled:shadow-none;
    }
</style>

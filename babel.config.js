module.exports = function(api) {
    console.log(api.env('es'));

    return {
        presets: 
        [
            '@babel/preset-typescript',
            [
                '@babel/preset-env',
                {
                    "modules": api.env('es') ? false: 'commonjs',
                }
            ]
        ]
    }
}
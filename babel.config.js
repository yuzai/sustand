module.exports = function(api) {
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
module.exports = {
    apps: [{
        name: "ma-links",
        script: "npm",
        args: "start -- -p 3001",
        cwd: "/var/www/ma-links",
        env: {
            NODE_ENV: "production",
            PORT: 3001
        }
    }]
}

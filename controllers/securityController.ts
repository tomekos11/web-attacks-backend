import { getSecurity, setSecurity } from "services/securityService.js";

export let csrfSecurityEnabled = true;
export let xssSecurityEnabled = true;
export let xFrameOptionsSecurityEnabled = true;
export let cspFrameAncestorsSecurityEnabled = true;
export let sqlInjectionParameterizedEnabled = false;
export let sqlInjectionInputValidationEnabled = false;
export let sqlInjectionLeastPrivilegeEnabled = false;
export let sqlInjectionErrorHandlingEnabled = false;
export let sqlInjectionOrmEnabled = false;

export const SQL_INJECTION_SETTINGS = [
    'sql-injection-parameterized',
    'sql-injection-input-validation',
    'sql-injection-least-privilege',
    'sql-injection-error-handling',
    'sql-injection-orm',
] as const;

export type SqlInjectionSetting = typeof SQL_INJECTION_SETTINGS[number];

const applySqlInjectionSetting = (name: string, isActive: boolean) => {
    switch (name) {
        case 'sql-injection-parameterized': sqlInjectionParameterizedEnabled = !!isActive; break;
        case 'sql-injection-input-validation': sqlInjectionInputValidationEnabled = !!isActive; break;
        case 'sql-injection-least-privilege': sqlInjectionLeastPrivilegeEnabled = !!isActive; break;
        case 'sql-injection-error-handling': sqlInjectionErrorHandlingEnabled = !!isActive; break;
        case 'sql-injection-orm': sqlInjectionOrmEnabled = !!isActive; break;
    }
};
export let commandInjectionSecurityEnabled = true;
export let pathTraversalNormalizeEnabled = false;
export let pathTraversalResolveEnabled = false;
export let pathTraversalWhitelistEnabled = false;
export let pathTraversalBlacklistEnabled = false;
export let pathTraversalRealpathEnabled = false;
export let pathTraversalBlockOverwriteEnabled = false;

export const PATH_TRAVERSAL_VALIDATION_MODES = [
    'path-traversal-normalize',
    'path-traversal-resolve',
    'path-traversal-whitelist',
    'path-traversal-blacklist',
    'path-traversal-realpath',
] as const;

export type PathTraversalValidationMode = typeof PATH_TRAVERSAL_VALIDATION_MODES[number];

const applyPathTraversalSetting = (name: string, isActive: boolean) => {
    switch (name) {
        case 'path-traversal-normalize': pathTraversalNormalizeEnabled = !!isActive; break;
        case 'path-traversal-resolve': pathTraversalResolveEnabled = !!isActive; break;
        case 'path-traversal-whitelist': pathTraversalWhitelistEnabled = !!isActive; break;
        case 'path-traversal-blacklist': pathTraversalBlacklistEnabled = !!isActive; break;
        case 'path-traversal-realpath': pathTraversalRealpathEnabled = !!isActive; break;
        case 'path-traversal-block-overwrite': pathTraversalBlockOverwriteEnabled = !!isActive; break;
    }
};

export const getPathTraversalMode = (): 'none' | 'normalize' | 'resolve' | 'whitelist' | 'blacklist' | 'realpath' => {
    if (pathTraversalRealpathEnabled) return 'realpath';
    if (pathTraversalResolveEnabled) return 'resolve';
    if (pathTraversalBlacklistEnabled) return 'blacklist';
    if (pathTraversalWhitelistEnabled) return 'whitelist';
    if (pathTraversalNormalizeEnabled) return 'normalize';
    return 'none';
};

const enforceExclusivePathTraversalModes = async (activeMode: PathTraversalValidationMode | null) => {
    if (!activeMode) return;

    for (const mode of PATH_TRAVERSAL_VALIDATION_MODES) {
        if (mode === activeMode) continue;

        await setSecurity(mode, 0);
        applyPathTraversalSetting(mode, false);
    }
};

export let cookieHttpOnlyEnabled = true;
export let cookieLaxEnabled = true;
export let cookieSecureEnabled = true;

export let httpsEnabled = true;

/** Nagłówki Access-Control-* (logika przeglądarki / preflight). */
export let corsSecurityEnabled = true;
/** Jawna odpowiedź 403 dla nieznanego Origin. */
export let originAllowlistSecurityEnabled = true;

export const setSecurities = async (req, res) => {
    const securityOptions = req.body.securityOptions;

    if (!Array.isArray(securityOptions)) {
        return res.status(400).json({ error: 'Invalid payload: securityOptions must be an array' });
    }

    try {
        for (const { name, isActive } of securityOptions) {
            await setSecurity(name, isActive);

            switch(name) {
                case 'csrf-token': csrfSecurityEnabled = !!isActive; break;
                case 'xss': xssSecurityEnabled = !!isActive; break;
                case 'x-frame-options': xFrameOptionsSecurityEnabled = !!isActive; break;
                case 'csp-frame-ancestors': cspFrameAncestorsSecurityEnabled = !!isActive; break;
                case 'sql-injection-parameterized':
                case 'sql-injection-input-validation':
                case 'sql-injection-least-privilege':
                case 'sql-injection-error-handling':
                case 'sql-injection-orm':
                    applySqlInjectionSetting(name, !!isActive);
                    break;
                case 'command-injection': commandInjectionSecurityEnabled = !!isActive; break;
                case 'path-traversal-normalize':
                case 'path-traversal-resolve':
                case 'path-traversal-whitelist':
                case 'path-traversal-blacklist':
                case 'path-traversal-realpath':
                case 'path-traversal-block-overwrite':
                    applyPathTraversalSetting(name, !!isActive);
                    break;
                case 'cookie-lax': cookieLaxEnabled = !!isActive; break;
                case 'cookie-secure': cookieSecureEnabled = !!isActive; break;
                case 'cookie-http-only': cookieHttpOnlyEnabled = !!isActive; break;
                case 'cors': corsSecurityEnabled = !!isActive; break;
                case 'origin-allowlist': originAllowlistSecurityEnabled = !!isActive; break;
                // case 'https': httpsEnabled = !!isActive; break;
            }
        }

        const activeValidationMode = PATH_TRAVERSAL_VALIDATION_MODES.find((mode) => {
            const option = securityOptions.find((item) => item.name === mode);
            return !!option?.isActive;
        }) ?? null;

        await enforceExclusivePathTraversalModes(activeValidationMode);

        const updatedOptions = await getSecurity();

    return res.json(updatedOptions);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

export const getSecurities = async (req, res) => {
    const securityOptions = await getSecurity();
    return res.json(securityOptions)
}

export const initEnabled = async () => {
    const securityOptions = await getSecurity();

    for (const { name, isActive } of securityOptions) {
        switch(name) {
            case 'csrf-token': csrfSecurityEnabled = !!isActive; break;
            case 'xss': xssSecurityEnabled = !!isActive; break;
            case 'x-frame-options': xFrameOptionsSecurityEnabled = !!isActive; break;
            case 'csp-frame-ancestors': cspFrameAncestorsSecurityEnabled = !!isActive; break;
            case 'sql-injection-parameterized':
            case 'sql-injection-input-validation':
            case 'sql-injection-least-privilege':
            case 'sql-injection-error-handling':
            case 'sql-injection-orm':
                applySqlInjectionSetting(name, !!isActive);
                break;
            case 'command-injection': commandInjectionSecurityEnabled = !!isActive; break;
            case 'path-traversal-normalize':
            case 'path-traversal-resolve':
            case 'path-traversal-whitelist':
            case 'path-traversal-blacklist':
            case 'path-traversal-realpath':
            case 'path-traversal-block-overwrite':
                applyPathTraversalSetting(name, !!isActive);
                break;
            case 'cookie-lax': cookieLaxEnabled = !!isActive; break;
            case 'cookie-secure': cookieSecureEnabled = !!isActive; break;
            case 'cookie-http-only': cookieHttpOnlyEnabled = !!isActive; break;
            case 'cors': corsSecurityEnabled = !!isActive; break;
            case 'origin-allowlist': originAllowlistSecurityEnabled = !!isActive; break;
            // case 'https': httpsEnabled = !!isActive; break;
        }
    }

}

export const checkEnabledSecurity = (req, res) => {
    const enabledOptions = {
        csrfSecurityEnabled,
        xssSecurityEnabled,
        xFrameOptionsSecurityEnabled,
        cspFrameAncestorsSecurityEnabled,
        sqlInjectionParameterizedEnabled,
        sqlInjectionInputValidationEnabled,
        sqlInjectionLeastPrivilegeEnabled,
        sqlInjectionErrorHandlingEnabled,
        sqlInjectionOrmEnabled,
        pathTraversalNormalizeEnabled,
        pathTraversalResolveEnabled,
        pathTraversalWhitelistEnabled,
        pathTraversalBlacklistEnabled,
        pathTraversalRealpathEnabled,
        pathTraversalBlockOverwriteEnabled,
        pathTraversalMode: getPathTraversalMode(),
        commandInjectionSecurityEnabled,
        cookieLaxEnabled,
        cookieSecureEnabled,
        cookieHttpOnlyEnabled,
        httpsEnabled,
        corsSecurityEnabled,
        originAllowlistSecurityEnabled,
    }

    return res.json(enabledOptions) 
}
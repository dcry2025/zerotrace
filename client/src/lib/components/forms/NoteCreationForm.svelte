<script lang="ts">
  import { goto } from '$app/navigation';
  import { toast } from '@zerodevx/svelte-toast';
  import { notesService, PASSWORD_VALIDATION, PUBLIC_URL } from '$lib';
  import { slide, fade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { t } from '$lib/i18n/i18n';
  
  let content = $state('');
  let password = $state('');
  let passwordConfirm = $state('');
  let expiresInHours = $state(24); // Default to 24 hours
  let notifyOnRead = $state(false);
  let showOptions = $state(false);
  let loading = $state(false);
  let passwordError = $state('');
  let showPasswordRequirements = $state(false);

  function validatePassword(pwd: string): { isValid: boolean; error: string } {
    if (!pwd) {
      return { isValid: true, error: '' }; // Password is optional
    }

    if (pwd.length < PASSWORD_VALIDATION.MIN_LENGTH) {
      return { 
        isValid: false, 
        error: $t('home.form.password.errors.minLength').replace('{min}', String(PASSWORD_VALIDATION.MIN_LENGTH))
      };
    }

    if (pwd.length > PASSWORD_VALIDATION.MAX_LENGTH) {
      return { 
        isValid: false, 
        error: $t('home.form.password.errors.maxLength').replace('{max}', String(PASSWORD_VALIDATION.MAX_LENGTH))
      };
    }

    // Check for at least one number or special character (recommended but not required)
    const hasNumberOrSpecial = /[0-9!@#$%^&*(),.?":{}|<>]/.test(pwd);
    if (!hasNumberOrSpecial) {
      return {
        isValid: false,
        error: $t('home.form.password.errors.special')
      };
    }

    return { isValid: true, error: '' };
  }

  function getPasswordStrength(pwd: string): 'weak' | 'medium' | 'strong' | null {
    if (!pwd) return null;
    
    if (pwd.length < 6) return 'weak';
    
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    const score = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (pwd.length >= 12 && score >= 3) return 'strong';
    if (pwd.length >= 8 && score >= 2) return 'medium';
    return 'weak';
  }

  function hasNumberOrSpecialChar(pwd: string): boolean {
    return /[0-9!@#$%^&*(),.?":{}|<>]/.test(pwd);
  }

  $effect(() => {
    if (password) {
      showPasswordRequirements = true;
      const validation = validatePassword(password);
      if (!validation.isValid) {
        passwordError = validation.error;
      } else if (passwordConfirm && password !== passwordConfirm) {
        passwordError = $t('home.form.password.errors.mismatch');
      } else {
        passwordError = '';
      }
    } else {
      showPasswordRequirements = false;
      passwordError = '';
    }
  });

  async function handleCreateNote() {
    if (!content.trim()) {
      toast.push($t('home.form.errors.emptyContent'), {
        theme: {
          '--toastBackground': '#EF4444',
          '--toastColor': '#FFFFFF',
          '--toastBarBackground': '#DC2626'
        }
      });
      return;
    }

    // Validate password if provided
    if (password) {
      const validation = validatePassword(password);
      if (!validation.isValid) {
        toast.push(validation.error, {
          theme: {
            '--toastBackground': '#EF4444',
            '--toastColor': '#FFFFFF',
            '--toastBarBackground': '#DC2626'
          }
        });
        return;
      }

      if (password !== passwordConfirm) {
        toast.push($t('home.form.errors.passwordMismatch'), {
          theme: {
            '--toastBackground': '#EF4444',
            '--toastColor': '#FFFFFF',
            '--toastBarBackground': '#DC2626'
          }
        });
        return;
      }
    }

    loading = true;

    try {
      const response = await notesService.createNote({
        content: content.trim(),
        password: password.trim() || undefined,
        expiresInDays: Math.ceil(expiresInHours / 24), // Convert hours to days for backend
        notifyOnRead: notifyOnRead,
        telegramUsername: undefined, // Will be linked via bot deep link
      });

      // Service returns: { uniqueLink, noteKey, message }
      if (response.uniqueLink && response.noteKey) {
        // Build full URL with noteKey in fragment
        // Always use PUBLIC_URL from constants
        const publicUrl = PUBLIC_URL;
        const fullUrl = `${publicUrl}/note/${response.uniqueLink}#${response.noteKey}`;
        
        const params = new URLSearchParams({
          link: encodeURIComponent(fullUrl),
          notify: notifyOnRead.toString(), // Pass notification preference
        });
        
        goto(`/created?${params.toString()}`);
      } else {
        throw new Error('Failed to create note');
      }
    } catch (error: any) {
      console.error('Error creating note:', error);
      
      // Extract error message from ky error
      let errorMessage = $t('home.form.errors.createFailed');
      if (error?.response) {
        try {
          const errorData = await error.response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Use default error message
        }
      }
      
      toast.push(errorMessage, {
        theme: {
          '--toastBackground': '#EF4444',
          '--toastColor': '#FFFFFF',
          '--toastBarBackground': '#DC2626'
        }
      });
    } finally {
      loading = false;
    }
  }
</script>

<!-- Note Creation Form -->
<div class="card max-w-2xl mx-auto">
  <!-- Form Header -->
  <div class="bg-blue-50 rounded-t-xl -m-6 mb-6 px-6 py-4 border-b border-blue-100">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="text-2xl">🔐</div>
        <h3 class="text-xl font-bold text-gray-900">{$t('home.form.title')}</h3>
      </div>
      <button
        onclick={() => showOptions = !showOptions}
        class="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        aria-label={$t('common.actions.options')}
      >
        <span>⚙️</span>
        <span>{$t('common.actions.options')}</span>
      </button>
    </div>
  </div>

  <!-- Form Content -->
  <div class="space-y-6">
    <!-- Note Content -->
    <div>
      <label for="content" class="block text-sm font-semibold text-gray-700 mb-2">
        {$t('home.form.content.label')}
      </label>
      <textarea
        id="content"
        bind:value={content}
        rows="8"
        class="input-field resize-y"
        placeholder={$t('home.form.content.placeholder')}
        disabled={loading}
      ></textarea>
      <p class="mt-1 text-sm text-gray-500">{content.length} {$t('home.form.content.counter').replace('{count}', content.length.toString())}</p>
    </div>

    <!-- Advanced Options -->
    {#if showOptions}
      <div 
        class="bg-gray-50 rounded-xl p-6 space-y-4 border border-gray-200"
        transition:slide={{ duration: 300, easing: quintOut }}
      >
        <h4 class="text-lg font-semibold text-gray-800 flex items-center space-x-2">
          <span>⚙️</span>
          <span>{$t('common.actions.options')}</span>
        </h4>

        <!-- Password -->
        <div class="space-y-3">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            {$t('home.form.password.label')}
          </label>
          <div class="space-y-2">
            <input
              id="password"
              type="password"
              bind:value={password}
              placeholder={$t('home.form.password.placeholder')}
              class="input-field {passwordError && password ? 'border-red-500 focus:ring-red-500' : ''}"
              disabled={loading}
            />
            
            {#if password}
              <!-- Password Strength Indicator -->
              <div 
                class="space-y-2"
                transition:slide={{ duration: 300, easing: quintOut }}
              >
                <div class="flex items-center space-x-2">
                  <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    {#if getPasswordStrength(password) === 'weak'}
                      <div class="h-full bg-red-500 transition-all duration-300" style="width: 33%"></div>
                    {:else if getPasswordStrength(password) === 'medium'}
                      <div class="h-full bg-yellow-500 transition-all duration-300" style="width: 66%"></div>
                    {:else if getPasswordStrength(password) === 'strong'}
                      <div class="h-full bg-green-500 transition-all duration-300" style="width: 100%"></div>
                    {/if}
                  </div>
                  <span class="text-xs font-medium {
                    getPasswordStrength(password) === 'weak' ? 'text-red-600' :
                    getPasswordStrength(password) === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }">
                    {getPasswordStrength(password) === 'weak' ? $t('home.form.password.strength.weak') :
                     getPasswordStrength(password) === 'medium' ? $t('home.form.password.strength.medium') :
                     $t('home.form.password.strength.strong')}
                  </span>
                </div>

                <!-- Password confirmation -->
                <input
                  id="password-confirm"
                  type="password"
                  bind:value={passwordConfirm}
                  placeholder={$t('home.form.password.confirm')}
                  class="input-field {passwordError && passwordConfirm ? 'border-red-500 focus:ring-red-500' : ''}"
                  disabled={loading}
                />

                <!-- Error message -->
                {#if passwordError}
                  <p 
                    class="text-sm text-red-600 flex items-center space-x-1"
                    transition:slide={{ duration: 200, easing: quintOut }}
                  >
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <span>{passwordError}</span>
                  </p>
                {/if}

                <!-- Password requirements -->
                {#if showPasswordRequirements && !passwordError}
                  <div 
                    class="text-xs text-gray-600 space-y-1 bg-blue-50 p-3 rounded-lg"
                    transition:slide={{ duration: 300, easing: quintOut }}
                  >
                    <p class="font-semibold text-gray-700 mb-1">{$t('home.form.password.requirements.title')}</p>
                    <ul class="space-y-1">
                      <li class="flex items-center space-x-1 {password.length >= PASSWORD_VALIDATION.MIN_LENGTH ? 'text-green-600' : ''}">
                        <span>{password.length >= PASSWORD_VALIDATION.MIN_LENGTH ? '✓' : '○'}</span>
                        <span>{$t('home.form.password.requirements.minLength').replace('{min}', String(PASSWORD_VALIDATION.MIN_LENGTH))}</span>
                      </li>
                      <li class="flex items-center space-x-1 {hasNumberOrSpecialChar(password) ? 'text-green-600' : ''}">
                        <span>{hasNumberOrSpecialChar(password) ? '✓' : '○'}</span>
                        <span>{$t('home.form.password.requirements.special')}</span>
                      </li>
                      <li class="flex items-center space-x-1 {password === passwordConfirm && passwordConfirm ? 'text-green-600' : ''}">
                        <span>{password === passwordConfirm && passwordConfirm ? '✓' : '○'}</span>
                        <span>{$t('home.form.password.requirements.match')}</span>
                      </li>
                    </ul>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        </div>

        <!-- Expiration -->
        <div>
          <label for="expires" class="block text-sm font-medium text-gray-700 mb-2">
            {$t('home.form.expiration.label')}
          </label>
          <div class="relative">
            <select
              id="expires"
              bind:value={expiresInHours}
              class="w-full px-4 py-3 pr-10 text-gray-900 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <option value={1}>{$t('home.form.expiration.1h')}</option>
              <option value={24}>{$t('home.form.expiration.24h')}</option>
              <option value={168}>{$t('home.form.expiration.7d')}</option>
              <option value={720}>{$t('home.form.expiration.30d')}</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Notify on Read via Telegram -->
        <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <div class="flex items-start space-x-3">
            <input
              id="notify"
              type="checkbox"
              bind:checked={notifyOnRead}
              class="w-5 h-5 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              disabled={loading}
            />
            <label for="notify" class="flex-1 text-sm">
              <div class="font-semibold text-gray-900 mb-1">
                {$t('home.form.notify.title')}
              </div>
              <div class="text-gray-600">
                {$t('home.form.notify.description')}
              </div>
            </label>
          </div>
        </div>
      </div>
    {/if}

    <!-- Create Button -->
    <button
      onclick={handleCreateNote}
      disabled={loading || !content.trim()}
      class="w-full btn-primary py-3 text-lg font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
    >
      {#if loading}
        <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{$t('home.form.creating')}</span>
      {:else}
        <span>🔒</span>
        <span>{$t('common.actions.create')}</span>
      {/if}
    </button>
  </div>
</div>

<script lang="ts">
  import { Header, Footer, CONTACTS } from '$lib';
  import { t } from '$lib/i18n/i18n';
</script>

<svelte:head>
  <title>{$t('faq.title')}</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
  <Header subtitle={$t('faq.subtitle')} showBackButton={true} />

  <!-- Main Content -->
  <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <div class="p-8">
        <div class="prose max-w-none">
          <p class="text-lg text-gray-700 mb-8">{$t('faq.intro')}</p>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q1.question')}</h2>
          <p class="text-gray-700 mb-6">{$t('faq.q1.answer')}</p>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q2.question')}</h2>
          <p class="text-gray-700 mb-4">{$t('faq.q2.answer1')}</p>
          <p class="text-gray-700 mb-6">{$t('faq.q2.answer2')}</p>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q3.question')}</h2>
          <p class="text-gray-700 mb-4">{$t('faq.q3.answer')}</p>
          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>{$t('faq.q3.point1')}</li>
            <li>{$t('faq.q3.point2')}</li>
            <li>{$t('faq.q3.point3')}</li>
            <li>{$t('faq.q3.point4')}</li>
            <li>{$t('faq.q3.point5')}</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q4.question')}</h2>
          <p class="text-gray-700 mb-6">{$t('faq.q4.answer')}</p>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q5.question')}</h2>
          <p class="text-gray-700 mb-6">{$t('faq.q5.answer')}</p>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q6.question')}</h2>
          <p class="text-gray-700 mb-6">{$t('faq.q6.answer')}</p>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q7.question')}</h2>
          <p class="text-gray-700 mb-6">{$t('faq.q7.answer')}</p>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q8.question')}</h2>
          <p class="text-gray-700 mb-4">{$t('faq.q8.answer')}</p>
          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>{$t('faq.q8.point1')}</li>
            <li>{$t('faq.q8.point2')}</li>
            <li>{$t('faq.q8.point3')}</li>
            <li>{$t('faq.q8.point4')}</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q9.question')}</h2>
          <p class="text-gray-700 mb-4">{$t('faq.q9.answer')}</p>
          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>{$t('faq.q9.point1')}</li>
            <li>{$t('faq.q9.point2')}</li>
            <li>{$t('faq.q9.point3')}</li>
            <li>{$t('faq.q9.point4')}</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q10.question')}</h2>
          <p class="text-gray-700 mb-6">{$t('faq.q10.answer')}</p>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q11.question')}</h2>
          <p class="text-gray-700 mb-6">{$t('faq.q11.answer')}</p>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q12.question')}</h2>
          <p class="text-gray-700 mb-6">{$t('faq.q12.answer')}</p>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q13.question')}</h2>
          <p class="text-gray-700 mb-6">{$t('faq.q13.answer')}</p>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q14.question')}</h2>
          <p class="text-gray-700 mb-4">{$t('faq.q14.answer')}</p>
          <ul class="list-disc list-inside text-gray-700 mb-6 space-y-2">
            <li>{$t('faq.q14.point1')}</li>
            <li>{$t('faq.q14.point2')}</li>
            <li>{$t('faq.q14.point3')}</li>
            <li>@{CONTACTS.TWITTER.username} / @{CONTACTS.TELEGRAM.username}</li>
          </ul>

          <h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">{$t('faq.q15.question')}</h2>
          <p class="text-gray-700 mb-6">{$t('faq.q15.answer')}</p>

          <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mt-8 border border-blue-200">
            <h3 class="text-lg font-semibold text-blue-900 mb-4">{$t('faq.stillQuestions')}</h3>
            <p class="text-blue-800 mb-4">{$t('faq.stillQuestionsText')}</p>
            
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                  </svg>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-600">Twitter / X</p>
                  <a href={CONTACTS.TWITTER.url} target="_blank" rel="noopener noreferrer" 
                     class="text-blue-700 hover:text-blue-900 font-bold hover:underline">@{CONTACTS.TWITTER.username}</a>
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-600">Telegram</p>
                  <a href={CONTACTS.TELEGRAM.url} target="_blank" rel="noopener noreferrer" 
                     class="text-blue-700 hover:text-blue-900 font-bold hover:underline">@{CONTACTS.TELEGRAM.username}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <Footer />
</div>

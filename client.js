// Browser half of the Create Skills plugin: a Skills page in the sidebar with
// an installed-skills list, a catalog, and an editor for SKILL.md.
// Talks to the host half over the same-origin JSON API at
// /plugins/create-skills/api/*.
window.__ModuleLoader__.load({
  id: 'create-skills',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'create-skills';
    const API = '/plugins/create-skills/api';

    const RU = {
      title: 'Skills',
      subtitle: 'Скиллы проекта: источник, вес в промпте и доступность модели.',
      tabInstalled: 'Установленные',
      tabCatalog: 'Каталог',
      newSkill: 'Новый скилл',
      refresh: 'Обновить',
      load: 'Загрузить',
      chooseFolder: 'Выбрать папку…',
      recentPlaces: 'Недавние',
      restartHint: 'Похоже, приложение не перезапущено после обновления плагина — перезапустите DSH.',
      pathPlaceholder: 'Путь к проекту',
      loading: 'Загрузка…',
      saving: 'Сохраняем…',
      error: 'Ошибка',
      retry: 'Повторить',
      empty: 'В этом проекте пока нет скиллов',
      emptyHint: 'Создайте .dsh/skills/<имя>/SKILL.md — скилл появится здесь без перезапуска.',
      modelOff: 'скрыт от модели',
      modelOn: 'для модели',
      tokens: 'токенов/запрос',
      skills: 'скиллов',
      incomplete: 'Каталог неполный: часть провайдеров не ответила.',
      estimate: 'Вес — оценка по длине имени и описания.',
      budgetOver: 'Каталог большой',
      budgetHint: 'Выключите лишние скиллы: они останутся доступны по /имя, но исчезнут из промпта модели.',
      versions: 'Версии',
      saveVersion: 'Сохранить версию',
      versionLabel: 'Метка версии',
      noVersions: 'Версий пока нет',
      pruneVersions: 'Оставить последнюю',
      confirmPrune: 'Удалить все версии, кроме последней?',
      pruned: 'Удалено версий',
      versionSaved: 'Версия сохранена',
      versionApplied: 'Версия применена',
      close: 'Закрыть',
      apply: 'Применить',
      readOnly: 'только чтение',
      edit: 'Править',
      save: 'Сохранить',
      cancel: 'Отмена',
      create: 'Создать',
      delete: 'Удалить',
      enable: 'Включить',
      disable: 'Выключить',
      confirmDelete: 'Удалить скилл',
      scope: 'Куда сохранить',
      category: 'Категория',
      noCategory: 'Без категории',
      newCategory: 'Своя категория',
      newCategoryPrompt: 'Название новой категории',
      suggestCategory: 'ИИ подберёт категорию',
      createCategoryConfirm: 'Создать категорию',
      groupTask: 'Задача',
      groupTaskPlaceholder: 'Например: запустить лендинг',
      groupRun: 'Сгруппировать под задачу',
      groupReset: 'Обычный вид',
      groupOthers: 'Остальные',
      grouping: 'Раскладываем…',
      searchPlaceholder: 'Поиск по имени',
      nothingFound: 'Ничего не найдено',
      allDisabled: 'Все скиллы отключены — включайте их в каталоге.',
      hiddenSkills: 'отключено',
      scopeProject: 'в проект',
      scopeUser: 'в пользовательские',
      scopeProjectHint: 'Скилл будет доступен только в этом проекте',
      scopeUserHint: 'Скилл будет доступен во всех проектах',
      workspace: 'Рабочая область',
      otherWorkspaces: 'Другие рабочие области',
      openWorkspace: 'Открыть',
      copyHere: 'Скопировать сюда',
      copiedHere: 'Скопировано',
      collectAll: 'Собрать со всех',
      collectDone: 'Собрано',
      skipped: 'пропущено',
      confirmCollect: 'Собрать скиллы со всех рабочих областей в текущую?',
      name: 'Имя (kebab-case)',
      description: 'Описание (одна строка, до 200 символов)',
      descriptionPlaceholder: 'Что делает и когда применять — по этой строке модель выбирает скилл',
      whenToUse: 'Когда применять (необязательно)',
      content: 'Инструкции (Markdown)',
      created: 'Скилл создан',
      loaded: 'Обновлено',
      saved: 'Сохранено',
      deleted: 'Удалено',
      installedNotice: 'Установлено',
      install: 'Установить',
      installing: 'Устанавливаем…',
      installedBadge: 'уже установлен',
      installAll: 'Установить всё',
      catalogEmpty: 'В каталоге нет скиллов',
      catalogLoading: 'Загружаем каталог…',
      allInstalled: 'Все скиллы категории уже установлены',
      catalogCreatedHint:
        'Созданные вручную скиллы появляются во вкладке «Установленные», а не в каталоге.',
      installScope: 'Установить',
      previewSource: 'Источник',
      preview: 'Просмотр',
      copy: 'Копировать',
      copied: 'Скопировано',
      copyFailed: 'Не удалось скопировать',
      tabCompare: 'Сравнение',
      tabArchive: 'Архив',
      archiveEmpty: 'Архив пуст',
      archiveHint: 'Удалённые скиллы лежат здесь, пока вы не восстановите или не удалите их навсегда.',
      restore: 'Восстановить',
      restoreDone: 'Восстановлено',
      emptyArchive: 'Очистить архив',
      confirmArchive: 'Переместить в архив',
      confirmEmptyArchive: 'Очистить архив? Скиллы будут удалены безвозвратно.',
      deletedForever: 'Удалено навсегда',
      deleteForever: 'Удалить навсегда',
      archiveDone: 'В архив',
      compareTask: 'Задача для сравнения (необязательно)',
      compareTaskPlaceholder: 'Например: подготовить квартальный отчёт с таблицей',
      improveWhat: 'Что улучшить (необязательно)',
      improveWhatPlaceholder:
        'Например: диаграммы строить в web-версии и подготавливать страницу для просмотра',
      runCompare: 'Сравнить',
      comparing: 'Сравниваем…',
      improve: 'Улучшить скилл',
      improving: 'Улучшаем…',
      improvedSaved: 'Улучшенная версия сохранена',
      chooseLeft: 'Выбрать левый',
      chooseRight: 'Выбрать правый',
      comparePick: 'Выберите скиллы слева и справа',
      compareCatalogHint:
        'Сравнивать можно и скиллы из каталога: они помечены «Каталог» и не требуют установки.',
      allCategories: 'Все категории',
      catBuiltin: 'Встроенные',
      catMine: 'Мои скиллы',
      catDocuments: 'Документы',
      catDevelopment: 'Разработка',
      catDesign: 'Дизайн',
      catMeta: 'Мета',
      verdictWinner: 'Лучше по оценке',
      chooseAndDisable: 'Выбрать этот скилл и выключить второй',
      otherReadOnly: 'Второй скилл встроенный — выключить его нельзя',
      diffTitle: 'Различия',
      sameText: 'Тексты совпадают',
      diffTooBig: '…текст слишком большой для построчного сравнения…',
      newSkillTemplate:
        '# Новый скилл\n\n' +
        '<!--\n' +
        'Подсказка. Удалите этот комментарий после заполнения — он попадёт в текст скилла.\n\n' +
        'Что нужно скиллу:\n' +
        '- Имя — латиница, kebab-case (my-skill); совпадает с именем папки.\n' +
        '- Описание — одна строка до 200 символов: что делает скилл и когда его применять.\n' +
        '  Модель выбирает скилл по этому тексту, поэтому начинайте с действия.\n' +
        '- Когда применять — необязательно: уточняет триггер, если описание общее.\n' +
        '- Инструкции — шаги и правила в императиве, критерии готовности, примеры.\n' +
        '  Файлы рядом со SKILL.md (references/, scripts/) указывайте относительными путями.\n' +
        '-->\n\n' +
        '## Когда применять\n\n' +
        'Короткий триггер: с какой задачей приходит пользователь.\n\n' +
        '## Шаги\n\n' +
        '1. Первый шаг.\n' +
        '2. Второй шаг.\n\n' +
        '## Проверка\n\n' +
        '- Как убедиться, что результат верный.\n',
      backupSaved: 'бэкап',
      currentVersion: 'текущая',
      chosen: 'Выбрано',
      source_project_dsh: 'проект',
      source_project_agents: 'проект (.agents)',
      source_user_dsh: 'пользователь',
      source_user_agents: 'пользователь (.agents)',
      source_custom: 'дополнительный',
      source_bundled: 'встроенный',
      source_runtime: 'runtime',
    };

    const EN = {
      title: 'Skills',
      subtitle: 'Project skills: source, prompt weight, and model availability.',
      tabInstalled: 'Installed',
      tabCatalog: 'Catalog',
      newSkill: 'New skill',
      refresh: 'Refresh',
      load: 'Load',
      chooseFolder: 'Choose folder…',
      recentPlaces: 'Recent',
      restartHint: 'DSH looks not restarted after the plugin update — restart the app.',
      pathPlaceholder: 'Project path',
      loading: 'Loading…',
      saving: 'Saving…',
      error: 'Error',
      retry: 'Retry',
      empty: 'No skills in this project yet',
      emptyHint: 'Create .dsh/skills/<name>/SKILL.md — it appears here without a restart.',
      modelOff: 'hidden from model',
      modelOn: 'model-visible',
      tokens: 'tokens/request',
      skills: 'skills',
      incomplete: 'Catalog is incomplete: some providers did not answer.',
      estimate: 'Weight is estimated from the name and description length.',
      budgetOver: 'Catalog is large',
      budgetHint: 'Disable rarely used skills: they stay available via /name but leave the model prompt.',
      versions: 'Versions',
      saveVersion: 'Save version',
      versionLabel: 'Version label',
      noVersions: 'No versions yet',
      pruneVersions: 'Keep the latest',
      confirmPrune: 'Delete every version except the latest one?',
      pruned: 'Versions deleted',
      versionSaved: 'Version saved',
      versionApplied: 'Version applied',
      close: 'Close',
      apply: 'Apply',
      readOnly: 'read-only',
      edit: 'Edit',
      save: 'Save',
      cancel: 'Cancel',
      create: 'Create',
      delete: 'Delete',
      enable: 'Enable',
      disable: 'Disable',
      confirmDelete: 'Delete skill',
      scope: 'Save to',
      category: 'Category',
      noCategory: 'No category',
      newCategory: 'New category',
      newCategoryPrompt: 'New category name',
      suggestCategory: 'Let AI pick a category',
      createCategoryConfirm: 'Create category',
      groupTask: 'Task',
      groupTaskPlaceholder: 'For example: launch a landing page',
      groupRun: 'Group for the task',
      groupReset: 'Normal view',
      groupOthers: 'Other skills',
      grouping: 'Grouping…',
      searchPlaceholder: 'Search by name',
      nothingFound: 'Nothing found',
      allDisabled: 'Every skill is disabled — enable them in the catalog.',
      hiddenSkills: 'disabled',
      scopeProject: 'project',
      scopeUser: 'user',
      scopeProjectHint: 'The skill will be available only in this project',
      scopeUserHint: 'The skill will be available in every project',
      workspace: 'Workspace',
      otherWorkspaces: 'Other workspaces',
      openWorkspace: 'Open',
      copyHere: 'Copy here',
      copiedHere: 'Copied',
      collectAll: 'Collect from all',
      collectDone: 'Collected',
      skipped: 'skipped',
      confirmCollect: 'Collect skills from every workspace into this one?',
      name: 'Name (kebab-case)',
      description: 'Description (one line, up to 200 chars)',
      descriptionPlaceholder: 'What it does and when to use it — the model picks skills by this line',
      whenToUse: 'When to use (optional)',
      content: 'Instructions (Markdown)',
      created: 'Skill created',
      loaded: 'Refreshed',
      saved: 'Saved',
      deleted: 'Deleted',
      installedNotice: 'Installed',
      install: 'Install',
      installing: 'Installing…',
      installedBadge: 'installed',
      installAll: 'Install all',
      catalogEmpty: 'The catalog is empty',
      catalogLoading: 'Loading catalog…',
      allInstalled: 'Every skill in this category is already installed',
      catalogCreatedHint:
        'Skills created by hand appear in the Installed tab, not in the catalog.',
      installScope: 'Install to',
      previewSource: 'Source',
      preview: 'Preview',
      copy: 'Copy',
      copied: 'Copied',
      copyFailed: 'Could not copy',
      tabCompare: 'Compare',
      tabArchive: 'Archive',
      archiveEmpty: 'The archive is empty',
      archiveHint: 'Deleted skills stay here until you restore them or delete them permanently.',
      restore: 'Restore',
      restoreDone: 'Restored',
      emptyArchive: 'Empty archive',
      confirmArchive: 'Move to archive',
      confirmEmptyArchive: 'Empty the archive? Skills will be deleted permanently.',
      deletedForever: 'Deleted permanently',
      deleteForever: 'Delete permanently',
      archiveDone: 'Archived',
      compareTask: 'Task to compare on (optional)',
      compareTaskPlaceholder: 'For example: prepare a quarterly report with a table',
      improveWhat: 'What to improve (optional)',
      improveWhatPlaceholder:
        'For example: render diagrams for the web version and prepare a page to view them',
      runCompare: 'Compare',
      comparing: 'Comparing…',
      improve: 'Improve skill',
      improving: 'Improving…',
      improvedSaved: 'Improved version saved',
      chooseLeft: 'Choose left',
      chooseRight: 'Choose right',
      comparePick: 'Pick a skill on both sides',
      compareCatalogHint:
        'Catalog skills can be compared too: they are marked "Catalog" and need no installation.',
      allCategories: 'All categories',
      catBuiltin: 'Bundled',
      catMine: 'My skills',
      catDocuments: 'Documents',
      catDevelopment: 'Development',
      catDesign: 'Design',
      catMeta: 'Meta',
      verdictWinner: 'AI verdict',
      chooseAndDisable: 'Choose this skill and disable the other',
      otherReadOnly: 'The other skill is bundled and cannot be disabled',
      diffTitle: 'Differences',
      sameText: 'Texts are identical',
      diffTooBig: '…text is too large for a line diff…',
      newSkillTemplate:
        '# New skill\n\n' +
        '<!--\n' +
        'Hint. Delete this comment after you fill the template: it becomes part of the skill text.\n\n' +
        'What a skill needs:\n' +
        '- Name — lowercase ASCII kebab-case (my-skill), matching the folder name.\n' +
        '- Description — one line up to 200 characters: what the skill does and when to apply it.\n' +
        '  The model picks skills by this text, so start with an action.\n' +
        '- When to use — optional; narrows the trigger when the description is broad.\n' +
        '- Instructions — imperative steps, rules, done criteria, examples.\n' +
        '  Reference files next to SKILL.md (references/, scripts/) by relative path.\n' +
        '-->\n\n' +
        '## When to use\n\n' +
        'Short trigger: the task the user brings.\n\n' +
        '## Steps\n\n' +
        '1. First step.\n' +
        '2. Second step.\n\n' +
        '## Check\n\n' +
        '- How to verify the result.\n',
      backupSaved: 'backup',
      currentVersion: 'current',
      chosen: 'Chosen',
      source_project_dsh: 'project',
      source_project_agents: 'project (.agents)',
      source_user_dsh: 'user',
      source_user_agents: 'user (.agents)',
      source_custom: 'custom',
      source_bundled: 'bundled',
      source_runtime: 'runtime',
    };

    const ZH = {
      title: '技能',
      subtitle: '项目技能：来源、提示词占用与模型可见性。',
      tabInstalled: '已安装',
      tabCatalog: '技能库',
      newSkill: '新建技能',
      refresh: '刷新',
      load: '加载',
      chooseFolder: '选择文件夹…',
      recentPlaces: '最近',
      restartHint: 'DSH 似乎未在插件更新后重启，请重启应用。',
      pathPlaceholder: '项目路径',
      loading: '加载中…',
      saving: '正在保存…',
      error: '错误',
      retry: '重试',
      empty: '此项目还没有技能',
      emptyHint: '创建 .dsh/skills/<名称>/SKILL.md —— 技能会立即出现在这里，无需重启。',
      modelOff: '对模型隐藏',
      modelOn: '对模型可见',
      tokens: '令牌/请求',
      skills: '个技能',
      incomplete: '技能目录不完整：部分来源未响应。',
      estimate: '占用为按名称和描述长度估算。',
      budgetOver: '技能目录过大',
      budgetHint: '关闭不常用的技能：它们仍可通过 /名称 调用，但不会出现在模型提示词中。',
      versions: '版本',
      saveVersion: '保存版本',
      versionLabel: '版本标签',
      noVersions: '暂无版本',
      pruneVersions: '只保留最新',
      confirmPrune: '删除除最新版本外的所有版本？',
      pruned: '已删除版本',
      versionSaved: '版本已保存',
      versionApplied: '版本已应用',
      close: '关闭',
      apply: '应用',
      readOnly: '只读',
      edit: '编辑',
      save: '保存',
      cancel: '取消',
      create: '创建',
      delete: '删除',
      enable: '启用',
      disable: '停用',
      confirmDelete: '删除技能',
      scope: '保存位置',
      category: '分类',
      noCategory: '无分类',
      newCategory: '自定义分类',
      newCategoryPrompt: '新分类名称',
      suggestCategory: '由 AI 推荐分类',
      createCategoryConfirm: '创建分类',
      groupTask: '任务',
      groupTaskPlaceholder: '例如：上线一个落地页',
      groupRun: '按任务分组',
      groupReset: '普通视图',
      groupOthers: '其他',
      grouping: '正在分组…',
      searchPlaceholder: '按名称搜索',
      nothingFound: '未找到',
      allDisabled: '所有技能均已停用——请在技能库中启用。',
      hiddenSkills: '已停用',
      scopeProject: '项目内',
      scopeUser: '用户目录',
      scopeProjectHint: '技能仅在当前项目中可用',
      scopeUserHint: '技能将在所有项目中可用',
      workspace: '工作区',
      otherWorkspaces: '其他工作区',
      openWorkspace: '打开',
      copyHere: '复制到这里',
      copiedHere: '已复制',
      collectAll: '全部收集',
      collectDone: '已收集',
      skipped: '已跳过',
      confirmCollect: '将所有工作区的技能收集到当前工作区？',
      name: '名称（kebab-case）',
      description: '描述（一行，最多 200 字符）',
      descriptionPlaceholder: '做什么、何时使用——模型依据这一行选择技能',
      whenToUse: '何时使用（可选）',
      content: '指令（Markdown）',
      created: '技能已创建',
      loaded: '已刷新',
      saved: '已保存',
      deleted: '已删除',
      installedNotice: '已安装',
      install: '安装',
      installing: '正在安装…',
      installedBadge: '已安装',
      installAll: '全部安装',
      catalogEmpty: '技能库中没有技能',
      catalogLoading: '正在加载技能库…',
      allInstalled: '该分类中的技能都已安装',
      catalogCreatedHint: '手动创建的技能会出现在「已安装」标签页，而不是技能库。',
      installScope: '安装到',
      previewSource: '来源',
      preview: '预览',
      copy: '复制',
      copied: '已复制',
      copyFailed: '复制失败',
      tabCompare: '对比',
      tabArchive: '回收站',
      archiveEmpty: '回收站为空',
      archiveHint: '已删除的技能会留在这里，直到您恢复或永久删除。',
      restore: '恢复',
      restoreDone: '已恢复',
      emptyArchive: '清空回收站',
      confirmArchive: '移到回收站',
      confirmEmptyArchive: '清空回收站？技能将被永久删除。',
      deletedForever: '已永久删除',
      deleteForever: '永久删除',
      archiveDone: '已移到回收站',
      compareTask: '用于对比的任务（可选）',
      compareTaskPlaceholder: '例如：准备一份带表格的季度报告',
      improveWhat: '要改进什么（可选）',
      improveWhatPlaceholder: '例如：为网页版绘制图表并准备一个查看页面',
      runCompare: '对比',
      comparing: '正在对比…',
      improve: '优化技能',
      improving: '正在优化…',
      improvedSaved: '优化版本已保存',
      chooseLeft: '选择左侧',
      chooseRight: '选择右侧',
      comparePick: '请在左右两侧各选择一个技能',
      compareCatalogHint: '也可以对比技能库中的技能：它们标有「技能库」，无需安装。',
      allCategories: '全部分类',
      catBuiltin: '内置',
      catMine: '我的技能',
      catDocuments: '文档',
      catDevelopment: '开发',
      catDesign: '设计',
      catMeta: '元技能',
      verdictWinner: '评估更优者',
      chooseAndDisable: '选择此技能并停用另一个',
      otherReadOnly: '另一个是内置技能，无法停用',
      diffTitle: '差异',
      sameText: '文本相同',
      diffTooBig: '…文本过大，无法逐行对比…',
      newSkillTemplate:
        '# 新技能\n\n' +
        '<!--\n' +
        '提示：填写完成后请删除这段注释，它会成为技能正文的一部分。\n\n' +
        '技能需要什么：\n' +
        '- 名称 —— 小写 ASCII，kebab-case（如 my-skill），与文件夹名一致。\n' +
        '- 描述 —— 一行，最多 200 字符：技能做什么、何时使用。\n' +
        '  模型根据这段文字选择技能，请以动作开头。\n' +
        '- 何时使用 —— 可选；描述较宽泛时用来收窄触发条件。\n' +
        '- 指令 —— 用祈使句写步骤与规则，给出完成标准和示例。\n' +
        '  与 SKILL.md 同目录的文件（references/、scripts/）请用相对路径引用。\n' +
        '-->\n\n' +
        '## 何时使用\n\n' +
        '一句话触发条件：用户带着什么任务而来。\n\n' +
        '## 步骤\n\n' +
        '1. 第一步。\n' +
        '2. 第二步。\n\n' +
        '## 检查\n\n' +
        '- 如何确认结果正确。\n',
      backupSaved: '备份',
      currentVersion: '当前',
      chosen: '已选择',
      source_project_dsh: '项目',
      source_project_agents: '项目（.agents）',
      source_user_dsh: '用户',
      source_user_agents: '用户（.agents）',
      source_custom: '附加',
      source_bundled: '内置',
      source_runtime: '运行时',
    };

    const styles = {
      page: {
        height: '100%',
        overflowY: 'auto',
        boxSizing: 'border-box',
        padding: '28px 32px 48px',
        color: 'var(--dsw-alias-label-primary)',
      },
      inner: { maxWidth: 980, margin: '0 auto' },
      header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
      title: { margin: 0, fontSize: 22, fontWeight: 600, lineHeight: 1.2 },
      subtitle: { margin: '6px 0 0', fontSize: 13, color: 'var(--dsw-alias-label-secondary)' },
      toolbar: { display: 'flex', gap: 8, marginTop: 20, alignItems: 'center', flexWrap: 'wrap' },
      input: {
        flex: '1 1 auto',
        minWidth: 220,
        padding: '7px 10px',
        fontSize: 13,
        color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-layer-1)',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 8,
        outline: 'none',
      },
      textarea: {
        width: '100%',
        boxSizing: 'border-box',
        minHeight: 150,
        padding: '9px 10px',
        fontSize: 13,
        lineHeight: 1.5,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-base)',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 8,
        outline: 'none',
        resize: 'vertical',
        // Keep text selection inside the field: the host shell disables
        // selection globally, and a wrapping label made drags bleed out.
        userSelect: 'text',
        WebkitUserSelect: 'text',
      },
      select: {
        padding: '7px 10px',
        fontSize: 13,
        color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-layer-1)',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 8,
        outline: 'none',
      },
      button: {
        padding: '7px 12px',
        fontSize: 13,
        color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-layer-1)',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 8,
        cursor: 'pointer',
      },
      small: { padding: '4px 9px', fontSize: 12 },
      primary: { borderColor: 'var(--dsw-alias-brand-primary)', color: 'var(--dsw-alias-brand-primary)' },
      danger: { color: 'var(--dsw-alias-state-error-primary)', borderColor: 'var(--dsw-alias-state-error-primary)' },
      tabs: { display: 'flex', gap: 4, marginTop: 22, borderBottom: '1px solid var(--dsw-alias-border-l1)' },
      tab: {
        padding: '8px 12px',
        fontSize: 13,
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid transparent',
        color: 'var(--dsw-alias-label-secondary)',
        cursor: 'pointer',
      },
      tabActive: { color: 'var(--dsw-alias-label-primary)', borderBottomColor: 'var(--dsw-alias-brand-primary)' },
      summary: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 },
      chip: {
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 999,
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        color: 'var(--dsw-alias-label-secondary)',
      },
      list: { marginTop: 18, display: 'flex', flexDirection: 'column', gap: 8 },
      row: {
        display: 'flex',
        gap: 16,
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '13px 16px',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-layer-1)',
        borderRadius: 10,
      },
      rowMain: { minWidth: 0, flex: '1 1 auto' },
      name: { fontSize: 14, fontWeight: 600, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
      description: { marginTop: 4, fontSize: 13, lineHeight: 1.45, color: 'var(--dsw-alias-label-secondary)' },
      rowSide: { display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' },
      actions: { display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' },
      badge: {
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 999,
        border: '1px solid var(--dsw-alias-border-l1)',
        color: 'var(--dsw-alias-label-secondary)',
        whiteSpace: 'nowrap',
      },
      warn: { color: 'var(--dsw-alias-state-warn-primary)', borderColor: 'var(--dsw-alias-state-warn-primary)' },
      ok: { color: 'var(--dsw-alias-state-success-primary)', borderColor: 'var(--dsw-alias-state-success-primary)' },
      mono: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
      note: { marginTop: 18, fontSize: 12, color: 'var(--dsw-alias-label-secondary)' },
      error: {
        marginTop: 18,
        padding: '12px 14px',
        border: '1px solid var(--dsw-alias-state-error-primary)',
        borderRadius: 10,
        color: 'var(--dsw-alias-state-error-primary)',
        fontSize: 13,
      },
      notice: {
        marginTop: 14,
        padding: '9px 12px',
        border: '1px solid var(--dsw-alias-state-success-primary)',
        borderRadius: 8,
        color: 'var(--dsw-alias-state-success-primary)',
        fontSize: 13,
      },
      noticeError: {
        marginTop: 14,
        padding: '9px 12px',
        border: '1px solid var(--dsw-alias-state-error-primary)',
        borderRadius: 8,
        color: 'var(--dsw-alias-state-error-primary)',
        fontSize: 13,
      },
      form: {
        marginTop: 18,
        padding: '16px',
        border: '1px solid var(--dsw-alias-border-l2)',
        background: 'var(--dsw-alias-bg-layer-1)',
        borderRadius: 12,
      },
      field: { display: 'block', marginTop: 12 },
      fieldLabel: { display: 'block', marginBottom: 5, fontSize: 12, color: 'var(--dsw-alias-label-secondary)' },
      formRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
      formActions: { display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' },
      sectionTitle: { marginTop: 26, marginBottom: 8, fontSize: 13, fontWeight: 600 },
      empty: { marginTop: 36, padding: '28px 20px', textAlign: 'center', border: '1px dashed var(--dsw-alias-border-l1)', borderRadius: 12 },
      emptyTitle: { fontSize: 14, fontWeight: 600 },
      emptyHint: { marginTop: 6, fontSize: 12, color: 'var(--dsw-alias-label-secondary)' },
      rowClickable: { cursor: 'pointer' },
      // Preview dialog: a plain <pre> keeps third-party SKILL.md text inert.
      modalBackdrop: {
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(0, 0, 0, 0.45)',
      },
      modal: {
        width: 'min(920px, 100%)',
        maxHeight: '82vh',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 20,
        background: 'var(--dsw-alias-bg-layer-1)',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 12,
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.35)',
      },
      modalHeader: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 },
      modalMeta: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)', wordBreak: 'break-all' },
      modalBody: { display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0, overflow: 'hidden' },
      pre: {
        margin: 0,
        padding: 12,
        maxHeight: '62vh',
        overflow: 'auto',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize: 12.5,
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: 'var(--dsw-alias-label-primary)',
        background: 'var(--dsw-alias-bg-base)',
        border: '1px solid var(--dsw-alias-border-l1)',
        borderRadius: 8,
        userSelect: 'text',
        WebkitUserSelect: 'text',
      },
    };

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Recent project paths, kept in the browser so switching between workspaces
    // is one click instead of retyping a path.
    const RECENT_PATHS_KEY = 'create-skills:recent-paths';

    function readRecentPaths() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(RECENT_PATHS_KEY) || '[]');
        return Array.isArray(parsed)
          ? parsed.filter((item) => typeof item === 'string').slice(0, 5)
          : [];
      } catch {
        return [];
      }
    }

    function shortPath(path) {
      const parts = String(path).split(/[\\/]+/).filter(Boolean);
      return parts.length > 1 ? parts.slice(-2).join('\\') : String(path);
    }

    function uiLang() {
      const lang = (document.documentElement && document.documentElement.lang) || navigator.language || 'en';
      const tag = String(lang).toLowerCase();
      if (tag.startsWith('zh')) return 'zh';
      if (tag.startsWith('ru')) return 'ru';
      return 'en';
    }

    async function api(path, options) {
      const response = await fetch(API + path, options);
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || `HTTP ${response.status}`);
      return body;
    }

    // Minimal line diff: LCS over both bodies, then keep changes with two
    // lines of context. Sized for SKILL.md files, not general-purpose diffs.
    function diffLines(leftText, rightText) {
      const a = leftText.split('\n');
      const b = rightText.split('\n');
      if (a.length > 800 || b.length > 800) {
        return [{ type: 'limit', text: '' }];
      }
      const n = a.length;
      const m = b.length;
      const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
      for (let i = n - 1; i >= 0; i -= 1) {
        for (let j = m - 1; j >= 0; j -= 1) {
          dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
      const ops = [];
      let i = 0;
      let j = 0;
      while (i < n && j < m) {
        if (a[i] === b[j]) {
          ops.push({ type: 'same', text: a[i] });
          i += 1;
          j += 1;
        } else if (dp[i + 1][j] >= dp[i][j + 1]) {
          ops.push({ type: 'remove', text: a[i] });
          i += 1;
        } else {
          ops.push({ type: 'add', text: b[j] });
          j += 1;
        }
      }
      while (i < n) {
        ops.push({ type: 'remove', text: a[i] });
        i += 1;
      }
      while (j < m) {
        ops.push({ type: 'add', text: b[j] });
        j += 1;
      }

      const keep = new Array(ops.length).fill(false);
      for (let k = 0; k < ops.length; k += 1) {
        if (ops[k].type === 'same') continue;
        for (let c = Math.max(0, k - 2); c <= Math.min(ops.length - 1, k + 2); c += 1) keep[c] = true;
      }
      const out = [];
      let skipped = false;
      for (let k = 0; k < ops.length; k += 1) {
        if (!keep[k]) {
          skipped = true;
          continue;
        }
        if (skipped) {
          out.push({ type: 'gap', text: '…' });
          skipped = false;
        }
        out.push(ops[k]);
      }
      return out.slice(0, 240);
    }

    // Sidebar glyph for the chosen icon: the same puzzle silhouette as icon.svg,
    // drawn solid so it survives 16 px. The notch is part of the outline path, so
    // the shape needs no mask and works on any sidebar background.
    const PANEL_PUZZLE_PATH =
      'M8.2 8A2.5 2.5 0 0 1 13.2 8H16A2 2 0 0 1 18 10V11.2A2 2 0 0 0 18 15.2V18A2 2 0 0 1 16 20H8A2 2 0 0 1 6 18V10A2 2 0 0 1 8 8Z';
    const PANEL_SPARK_POINTS = '20.3 1.6 21.1 3.4 22.9 4.2 21.1 5 20.3 6.8 19.5 5 17.7 4.2 19.5 3.4';

    function PanelIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 16;
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true },
        h('path', { d: PANEL_PUZZLE_PATH, fill: 'currentColor' }),
        h('polygon', { points: PANEL_SPARK_POINTS, fill: 'currentColor', opacity: 0.75 }),
      );
    }

    function sourceLabel(t, source) {
      const key = `source_${String(source).replace(/[^a-z0-9]+/gi, '_').toLowerCase()}`;
      const label = t(key);
      return typeof label === 'string' && label !== key ? label : String(source);
    }

    // Catalog content ships in Russian and English: Russian for the Russian UI,
    // English for every other language.
    function catalogText(entry) {
      if (!entry) return { title: '', description: '' };
      if (uiLang() === 'ru') return { title: entry.title, description: entry.description };
      return {
        title: entry.titleEn || entry.title,
        description: entry.descriptionEn || entry.description,
      };
    }

    // A category with no skills is a dead end in a filter, so a picker only
    // offers the categories the loaded skills actually carry.
    function categoriesWithSkills(skills, categories) {
      const ids = [];
      for (const skill of skills || []) {
        if (skill.category && !ids.includes(skill.category)) ids.push(skill.category);
      }
      return ids.map((id) => (categories || []).find((category) => category.id === id) || { id, title: id });
    }

    function categoryLabel(t, id, categories) {
      if (!id) return '';
      const known = {
        builtin: 'catBuiltin',
        mine: 'catMine',
        documents: 'catDocuments',
        development: 'catDevelopment',
        design: 'catDesign',
        meta: 'catMeta',
      };
      if (known[id]) return t(known[id]);
      const found = (categories || []).find((category) => category.id === id);
      return found ? found.title : id;
    }

    class Boundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { error: null };
      }
      static getDerivedStateFromError(error) {
        return { error };
      }
      componentDidCatch(error) {
        const message = error instanceof Error ? error.message : String(error);
        fetch(`${API}/client-event`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ event: 'error', message }),
        }).catch(() => {});
      }
      render() {
        if (this.state.error) {
          const message = this.state.error instanceof Error ? this.state.error.message : String(this.state.error);
          return h('div', { style: styles.error, role: 'alert' }, `Create Skills: ${message}`);
        }
        return this.props.children;
      }
    }

    // A "Skills" item in the Session context menu opens this page for the
    // workspace that session belongs to.
    let pendingWorkspacePath = null;
    const workspaceListeners = new Set();

    function workspacePathOf(ctx, target) {
      try {
        const snapshot = ctx.workspaces && ctx.workspaces.list ? ctx.workspaces.list.getSnapshot() : null;
        const list = snapshot && Array.isArray(snapshot.workspaces) ? snapshot.workspaces : [];
        const sessionId = target ? target.sessionId : null;
        const found = list.find(
          (workspace) => Array.isArray(workspace.sessionIds) && workspace.sessionIds.includes(sessionId),
        );
        if (found && typeof found.path === 'string' && found.path !== '') return found.path;
      } catch {
        // fall through to the session header
      }
      try {
        const sessions = ctx.get('sessions');
        const session = sessions && typeof sessions.get === 'function' ? sessions.get(target ? target.sessionId : null) : null;
        const cwd = session && session.header ? session.header.cwd : null;
        if (typeof cwd === 'string' && cwd !== '') return cwd;
      } catch {
        // fall through
      }
      return target && typeof target.path === 'string' ? target.path : null;
    }

    function openSkillsFor(ctx, path) {
      pendingWorkspacePath = path || null;
      if (path) {
        for (const listener of workspaceListeners) {
          try {
            listener(path);
          } catch {
            // one broken listener must not block the others
          }
        }
      }
      try {
        if (ctx.layout && typeof ctx.layout.selectPanel === 'function') ctx.layout.selectPanel('create-skills');
      } catch (error) {
        trackEvent('menu-open-failed', error instanceof Error ? error.message : String(error));
      }
    }

    function trackEvent(event, message) {
      fetch(`${API}/client-event`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ event, message: message ?? null }),
      }).catch(() => {});
    }

    function makePage(t, ctx) {
      // Re-render the page when the app locale changes: t() reads the current
      // locale on every call, but nothing would otherwise schedule a render.
      function useLocaleTick() {
        const [, setTick] = React.useState(0);
        React.useEffect(() => {
          if (!ctx.locale || typeof ctx.locale.subscribe !== 'function') return undefined;
          return ctx.locale.subscribe(() => setTick((value) => value + 1));
        }, []);
      }

      return function SkillsPage() {
        useLocaleTick();
        const [tab, setTab] = React.useState('installed');
        const [skillsState, setSkillsState] = React.useState({ status: 'loading' });
        const [catalogState, setCatalogState] = React.useState({ status: 'idle' });
        const [archiveState, setArchiveState] = React.useState({ status: 'idle', entries: [] });
        const [workspaces, setWorkspaces] = React.useState([]);
        const [workspaceSkills, setWorkspaceSkills] = React.useState([]);
        const [recentPaths, setRecentPaths] = React.useState(readRecentPaths);
        const [pickingFolder, setPickingFolder] = React.useState(false);
        const [pathDraft, setPathDraft] = React.useState('');
        const [editor, setEditor] = React.useState(null);
        const [busy, setBusy] = React.useState(null);
        const [notice, setNotice] = React.useState(null);
        const [versions, setVersions] = React.useState(null);
        const [compare, setCompare] = React.useState({
          left: { category: '', skill: '', catalogId: '', label: '' },
          right: { category: '', skill: '', catalogId: '', label: '' },
          task: '',
          improvement: '',
          busy: false,
          error: null,
          result: null,
          versions: { left: [], right: [] },
        });
        const [upgrading, setUpgrading] = React.useState(false);
        const [installScope, setInstallScope] = React.useState('project');
        const [skillSearch, setSkillSearch] = React.useState('');
        const [skillCategory, setSkillCategory] = React.useState('');
        const [groupTask, setGroupTask] = React.useState('');
        const [groups, setGroups] = React.useState(null);
        const [grouping, setGrouping] = React.useState(false);
        // A manual load or refresh keeps the current list on screen and only
        // disables the buttons; the first mount still shows the loading state.
        const [refreshing, setRefreshing] = React.useState(false);
        // null — the inline "new category" row is closed; a string is its input value.
        // A window.prompt would be the obvious control here, but the DSH Web client
        // runs in Electron, where prompt() is unavailable and the click would do nothing.
        const [categoryDraft, setCategoryDraft] = React.useState(null);
        // Body of the last picked compare side, shown before a comparison runs.
        const [sidePreview, setSidePreview] = React.useState(null);
        // Feedback next to the "Choose" button, so an apply is visible in place.
        const [appliedNotice, setAppliedNotice] = React.useState(null);
        // The skill last opened in the editor; Compare picks it up on open.
        const [lastSkill, setLastSkill] = React.useState(null);
        // Catalog preview: fetched on demand, so installing is a separate decision.
        const [preview, setPreview] = React.useState(null);
        // The editor and the versions panel render above the list; bumping this
        // counter scrolls them into view, otherwise a click far down the list
        // looks like it did nothing.
        const [panelTick, setPanelTick] = React.useState(0);
        const editorRef = React.useRef(null);
        const versionsRef = React.useRef(null);

        React.useEffect(() => {
          if (panelTick === 0) return;
          const node = editor ? editorRef.current : versions ? versionsRef.current : null;
          if (node && typeof node.scrollIntoView === 'function') {
            node.scrollIntoView({ block: 'start', behavior: 'smooth' });
          }
          // Only the open action should scroll; edits inside the form must not.
        }, [panelTick]);

        React.useEffect(() => {
          if (!preview && !editor && !versions) return undefined;
          const onKey = (event) => {
            if (event.key !== 'Escape') return;
            if (preview) setPreview(null);
            else if (editor) setEditor(null);
            else if (versions) setVersions(null);
          };
          window.addEventListener('keydown', onKey);
          return () => window.removeEventListener('keydown', onKey);
        }, [preview, editor, versions]);

        const rememberPath = (value) => {
          const next = String(value || '').trim();
          if (next === '') return;
          setRecentPaths((current) => {
            const list = [next, ...current.filter((item) => item !== next)].slice(0, 5);
            try {
              window.localStorage.setItem(RECENT_PATHS_KEY, JSON.stringify(list));
            } catch {
              // private mode: keep the in-memory list only
            }
            return list;
          });
        };

        const loadSkills = React.useCallback(async (cwd, quiet = false) => {
          if (quiet) setRefreshing(true);
          else setSkillsState({ status: 'loading' });
          try {
            const query = cwd ? `?cwd=${encodeURIComponent(cwd)}` : '';
            const body = await api(`/skills${query}`);
            setSkillsState({ status: 'ready', data: body });
            setPathDraft((current) => current || body.projectRoot || '');
            rememberPath(body.projectRoot || cwd);
            return { ok: true, count: Array.isArray(body.skills) ? body.skills.length : 0, root: body.projectRoot };
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setSkillsState({ status: 'error', message });
            return { ok: false, message };
          } finally {
            if (quiet) setRefreshing(false);
          }
        }, []);

        const loadCatalog = React.useCallback(async (cwd) => {
          setCatalogState({ status: 'loading' });
          try {
            const query = cwd ? `?cwd=${encodeURIComponent(cwd)}` : '';
            const body = await api(`/catalog${query}`);
            setCatalogState({ status: 'ready', data: body });
          } catch (error) {
            setCatalogState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
          }
        }, []);

        React.useEffect(() => {
          loadSkills();
        }, [loadSkills]);

        React.useEffect(() => {
          fetch(`${API}/client-event`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ event: 'mounted' }),
          }).catch(() => {});
        }, []);

        React.useEffect(() => {
          const listener = (path) => {
            if (!path) return;
            setTab('installed');
            setPathDraft(path);
            loadSkills(path);
            loadCatalog(path);
          };
          workspaceListeners.add(listener);
          if (pendingWorkspacePath) {
            const path = pendingWorkspacePath;
            pendingWorkspacePath = null;
            listener(path);
          }
          return () => workspaceListeners.delete(listener);
        }, [loadSkills, loadCatalog]);

        React.useEffect(() => {
          if ((tab === 'catalog' || tab === 'compare') && catalogState.status === 'idle') {
            loadCatalog(pathDraft.trim() || undefined);
          }
        }, [tab, catalogState.status, loadCatalog, pathDraft]);

        const loadArchive = React.useCallback(async () => {
          setArchiveState((current) => ({ status: 'loading', entries: current.entries }));
          try {
            const body = await api('/archive');
            setArchiveState({ status: 'ready', entries: Array.isArray(body.entries) ? body.entries : [] });
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setArchiveState({ status: 'error', entries: [], message });
          }
        }, []);

        React.useEffect(() => {
          if (tab === 'archive') loadArchive();
        }, [tab, loadArchive]);

        React.useEffect(() => {
          api('/workspaces')
            .then((body) => setWorkspaces(Array.isArray(body.workspaces) ? body.workspaces : []))
            .catch(() => {});
        }, []);

        const prefillRef = React.useRef(null);
        React.useEffect(() => {
          if (tab !== 'compare' || !lastSkill) return;
          // Prefill once per edited skill: a manual choice in Compare survives
          // tab switches until another skill is opened for editing.
          if (prefillRef.current === lastSkill) return;
          prefillRef.current = lastSkill;
          const next = {
            category: lastSkill.category || '',
            skill: lastSkill.name,
            catalogId: lastSkill.catalogId || '',
            label: '',
          };
          setCompare((current) => Object.assign({}, current, { left: next }));
          loadSidePreview('left', next);
          if (!next.catalogId) loadCompareVersions('left', next.name);
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [tab, lastSkill]);

        React.useEffect(() => {
          if (tab !== 'catalog') return;
          api('/workspace-skills')
            .then((body) => setWorkspaceSkills(Array.isArray(body.workspaces) ? body.workspaces : []))
            .catch(() => {});
        }, [tab]);

        React.useEffect(() => {
          if (!notice) return undefined;
          const timer = setTimeout(() => setNotice(null), 4000);
          return () => clearTimeout(timer);
        }, [notice]);

        // Diagnostics: every manual load lands in the plugin's /client-event log,
        // so a click that silently does nothing leaves a trace on the host.
        const track = (event, detail) => {
          fetch(`${API}/client-event`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ event, message: detail ?? null }),
          }).catch(() => {});
        };

        const reportLoad = (result) => {
          if (!result || !result.ok) {
            setNotice({ kind: 'error', text: `${t('error')}: ${result ? result.message : t('error')}` });
            return;
          }
          setNotice({ kind: 'ok', text: `${t('loaded')}: ${result.count} ${t('skills')}` });
        };

        const loadFromPath = async () => {
          const cwd = pathDraft.trim() || undefined;
          track('load', cwd ?? '(session cwd)');
          const result = await loadSkills(cwd, true);
          if (tab === 'catalog') await loadCatalog(cwd);
          reportLoad(result);
        };

        const switchToPath = async (path) => {
          const target = String(path || '').trim();
          if (target === '') return;
          setPathDraft(target);
          const result = await loadSkills(target, true);
          if (tab === 'catalog') await loadCatalog(target);
          reportLoad(result);
          rememberPath(target);
        };

        const chooseFolder = async () => {
          setPickingFolder(true);
          try {
            const body = await api('/pick-folder', { method: 'POST' });
            if (!body.path) return;
            await switchToPath(body.path);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            const stale = message.includes('HTTP 404') || message.includes('HTTP 405');
            setNotice({
              kind: 'error',
              text: stale ? `${message} · ${t('restartHint')}` : message,
            });
          } finally {
            setPickingFolder(false);
          }
        };

        const refresh = async () => {
          const cwd = pathDraft.trim() || undefined;
          track('refresh', cwd ?? '(session cwd)');
          await sleep(250);
          const result = await loadSkills(cwd, true);
          if (tab === 'catalog') await loadCatalog(cwd);
          reportLoad(result);
        };

        const openPreview = async (entry) => {
          if (!entry) return;
          setPreview({ id: entry.id, entry, status: 'loading', content: '', rawUrl: null, error: null });
          try {
            const body = await api(`/preview?id=${encodeURIComponent(entry.id)}`);
            setPreview((current) =>
              current && current.id === entry.id
                ? Object.assign({}, current, { status: 'ready', content: body.content, rawUrl: body.rawUrl })
                : current,
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setPreview((current) =>
              current && current.id === entry.id
                ? Object.assign({}, current, { status: 'error', error: message })
                : current,
            );
          }
        };

        const openCreate = () => {
          setTab('installed');
          setCategoryDraft(null);
          setPanelTick((value) => value + 1);
          setEditor({
            mode: 'create',
            scope: 'project',
            workspace: '',
            category: '',
            name: '',
            description: '',
            whenToUse: '',
            content: t('newSkillTemplate'),
            error: null,
            busy: false,
          });
        };

        const openEdit = async (skill) => {
          track('edit', skill.name);
          setLastSkill({ name: skill.name, category: skill.category || '', catalogId: '' });
          setCategoryDraft(null);
          setBusy(skill.name);
          try {
            const body = await api(`/skills?name=${encodeURIComponent(skill.name)}`);
            setPanelTick((value) => value + 1);
            setNotice({ kind: 'ok', text: `${t('edit')}: ${skill.name}` });
            setEditor({
              mode: 'edit',
              scope: skill.source === 'user-dsh' ? 'user' : 'project',
              category: body.category || skill.category || '',
              name: skill.name,
              description: body.description || '',
              whenToUse: body.whenToUse || '',
              content: body.content || '',
              error: null,
              busy: false,
            });
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          } finally {
            setBusy(null);
          }
        };

        const submitEditor = async () => {
          if (!editor) return;
          const payload = {
            name: editor.name.trim(),
            description: editor.description.trim(),
            whenToUse: editor.whenToUse.trim(),
            category: editor.category,
            content: editor.content,
          };
          if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(payload.name)) {
            setEditor((current) => ({ ...current, error: t('name') }));
            return;
          }
          if (payload.description === '') {
            setEditor((current) => ({ ...current, error: t('description') }));
            return;
          }
          setEditor((current) => ({ ...current, busy: true, error: null }));
          const targetWorkspace = editor.mode === 'create' ? editor.workspace || pathDraft.trim() : '';
          try {
            if (editor.mode === 'create') {
              await api(`/skills${targetWorkspace ? `?cwd=${encodeURIComponent(targetWorkspace)}` : ''}`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ ...payload, scope: editor.scope }),
              });
              setNotice({ kind: 'ok', text: t('created') });
              setLastSkill({ name: payload.name, category: editor.category || '', catalogId: '' });
            } else {
              await api('/skills', {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload),
              });
              setNotice({ kind: 'ok', text: t('saved') });
            }
            setEditor(null);
            setCategoryDraft(null);
            // A new skill lives in the installed list, not in the catalog, so
            // show the list where it can actually be seen right away.
            setTab('installed');
            if (targetWorkspace) setPathDraft(targetWorkspace);
            await loadSkills(targetWorkspace || pathDraft.trim() || undefined, true);
          } catch (error) {
            setEditor((current) => ({
              ...current,
              busy: false,
              error: error instanceof Error ? error.message : String(error),
            }));
          }
        };

        const toggleSkill = async (skill) => {
          setBusy(skill.name);
          try {
            await api('/skills', {
              method: 'PATCH',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ name: skill.name, enabled: !skill.modelInvocable }),
            });
            await refresh();
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          } finally {
            setBusy(null);
          }
        };

        const cwdQuery = () => {
          const cwd = pathDraft.trim();
          return cwd ? `?cwd=${encodeURIComponent(cwd)}` : '';
        };

        // Deleting a skill moves it to the archive; the archive owns the only
        // permanent delete, so a misclick stays recoverable. The installed list
        // only disables skills — deletion lives in the catalog and the editor.
        const removeSkill = async (skill) => {
          if (!window.confirm(`${t('confirmArchive')}: ${skill.name}?`)) return false;
          setBusy(skill.name);
          try {
            await api(`/archive${cwdQuery()}`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ name: skill.name }),
            });
            setNotice({ kind: 'ok', text: `${t('archiveDone')}: ${skill.name}` });
            await refresh();
            await loadArchive();
            return true;
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
            return false;
          } finally {
            setBusy(null);
          }
        };

        const restoreArchived = async (entry) => {
          setBusy(entry.id);
          try {
            await api(`/archive/restore${cwdQuery()}`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ id: entry.id }),
            });
            setNotice({ kind: 'ok', text: `${t('restoreDone')}: ${entry.name}` });
            await loadArchive();
            await loadSkills(pathDraft.trim() || undefined, true);
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          } finally {
            setBusy(null);
          }
        };

        const deleteArchivedForever = async (entry) => {
          if (!window.confirm(`${t('confirmDelete')} ${entry.name}?`)) return;
          setBusy(entry.id);
          try {
            await api('/archive/delete', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ id: entry.id }),
            });
            setNotice({ kind: 'ok', text: `${t('deletedForever')}: ${entry.name}` });
            await loadArchive();
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          } finally {
            setBusy(null);
          }
        };

        const emptyArchived = async () => {
          if (!window.confirm(t('confirmEmptyArchive'))) return;
          try {
            const body = await api('/archive/empty', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: '{}',
            });
            setNotice({ kind: 'ok', text: `${t('deletedForever')}: ${body.removed}` });
            await loadArchive();
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          }
        };

        const openWorkspace = async (workspace) => {
          setPathDraft(workspace.path);
          await loadSkills(workspace.path, true);
          await loadCatalog(workspace.path);
          setNotice({ kind: 'ok', text: `${t('loaded')}: ${workspace.title}` });
        };

        const copyHere = async (workspace, skill) => {
          const target = pathDraft.trim();
          setBusy(`copy:${skill.name}`);
          try {
            await api(`/skills/copy${target ? `?cwd=${encodeURIComponent(target)}` : ''}`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ name: skill.name, from: workspace.path }),
            });
            setNotice({ kind: 'ok', text: `${t('copiedHere')}: ${skill.name}` });
            await loadSkills(target || undefined, true);
            await loadCatalog(target || undefined);
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          } finally {
            setBusy(null);
          }
        };

        const collectAll = async () => {
          if (!window.confirm(t('confirmCollect'))) return;
          const target = pathDraft.trim();
          setBusy('collect');
          try {
            const body = await api(`/skills/collect${target ? `?cwd=${encodeURIComponent(target)}` : ''}`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: '{}',
            });
            setNotice({
              kind: 'ok',
              text: `${t('collectDone')}: ${body.copied.length} · ${t('skipped')}: ${body.skipped.length}`,
            });
            await loadSkills(target || undefined, true);
            await loadCatalog(target || undefined);
            const refreshed = await api('/workspace-skills').catch(() => null);
            if (refreshed && Array.isArray(refreshed.workspaces)) setWorkspaceSkills(refreshed.workspaces);
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          } finally {
            setBusy(null);
          }
        };

        const pruneVersionsNow = async () => {
          if (!versions) return;
          if (!window.confirm(t('confirmPrune'))) return;
          const skill = versions.skill;
          try {
            const body = await api('/versions/prune', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ skill }),
            });
            await openVersions({ name: skill });
            setNotice({ kind: 'ok', text: `${t('pruned')}: ${body.removed}` });
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          }
        };

        const openVersions = async (skill) => {
          track('versions', skill.name);
          setPanelTick((value) => value + 1);
          setNotice({ kind: 'ok', text: `${t('versions')}: ${skill.name}` });
          setVersions({ skill: skill.name, status: 'loading', list: [], label: '', error: null });
          try {
            const body = await api(`/versions?skill=${encodeURIComponent(skill.name)}`);
            setVersions((current) =>
              current && current.skill === skill.name ? Object.assign({}, current, { status: 'ready', list: body.versions }) : current,
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setVersions((current) => Object.assign({}, current, { status: 'error', error: message }));
          }
        };

        const saveVersionNow = async () => {
          if (!versions) return;
          const label = versions.label.trim();
          if (label === '') {
            setVersions(Object.assign({}, versions, { error: t('versionLabel') }));
            return;
          }
          try {
            await api('/versions', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ skill: versions.skill, label }),
            });
            setNotice({ kind: 'ok', text: t('versionSaved') });
            await openVersions({ name: versions.skill });
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setVersions(Object.assign({}, versions, { error: message }));
          }
        };

        const applyVersionNow = async (label) => {
          if (!versions) return;
          if (!window.confirm(`${t('apply')} ${label}?`)) return;
          try {
            const result = await api('/versions/apply', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ skill: versions.skill, label }),
            });
            setNotice({
              kind: 'ok',
              text: result && result.backup ? `${t('versionApplied')} (${t('backupSaved')}: ${result.backup})` : t('versionApplied'),
            });
            await refresh();
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          }
        };

        const removeVersionNow = async (label) => {
          if (!versions) return;
          if (!window.confirm(`${t('delete')} ${label}?`)) return;
          try {
            await api(`/versions?skill=${encodeURIComponent(versions.skill)}&label=${encodeURIComponent(label)}`, { method: 'DELETE' });
            await openVersions({ name: versions.skill });
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          }
        };

        const install = async (ids) => {
          if (ids.length === 0) {
            setNotice({ kind: 'error', text: t('allInstalled') });
            return;
          }
          setBusy(ids.join(','));
          try {
            const result = await api('/install', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ ids, scope: installScope }),
            });
            const failed = result.report.filter((item) => item.status === 'error');
            setNotice({
              kind: failed.length === 0 ? 'ok' : 'error',
              text:
                failed.length === 0
                  ? `${t('installedNotice')}: ${result.installed}`
                  : `${t('error')}: ${failed.map((item) => item.id + ' — ' + item.message).join('; ')}`,
            });
            await refresh();
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          } finally {
            setBusy(null);
          }
        };

        const data = skillsState.status === 'ready' ? skillsState.data : null;
        const catalog = catalogState.status === 'ready' ? catalogState.data : null;

        const loadCompareVersions = async (side, skill) => {
          if (!skill) return;
          try {
            const body = await api(`/versions?skill=${encodeURIComponent(skill)}`);
            setCompare((current) =>
              Object.assign({}, current, {
                versions: Object.assign({}, current.versions, { [side]: body.versions }),
              }),
            );
          } catch {
            setCompare((current) =>
              Object.assign({}, current, { versions: Object.assign({}, current.versions, { [side]: [] }) }),
            );
          }
        };

        const setCompareSide = (side, patch) => {
          setCompare((current) => {
            const next = Object.assign({}, current, { [side]: Object.assign({}, current[side], patch) });
            if (patch.skill !== undefined) {
              next.versions = Object.assign({}, current.versions, { [side]: [] });
            }
            return next;
          });
          if (patch.skill !== undefined) {
            setAppliedNotice(null);
            loadSidePreview(side, patch);
            if (patch.skill !== '' && !patch.catalogId) loadCompareVersions(side, patch.skill);
          }
        };

        const stripFrontmatter = (text) => {
          const match = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(text);
          return match ? text.slice(match[0].length) : text;
        };

        // Picking a side immediately shows its instructions, so the choice can
        // be read before the comparison (and without running the model).
        const loadSidePreview = async (side, spec) => {
          if (!spec || !spec.skill) {
            setSidePreview(null);
            return;
          }
          setSidePreview({ side, name: spec.skill, status: 'loading', content: '', error: null });
          try {
            const body = spec.catalogId
              ? await api(`/preview?id=${encodeURIComponent(spec.catalogId)}`)
              : await api(`/skills?name=${encodeURIComponent(spec.skill)}`);
            const content = spec.catalogId ? stripFrontmatter(body.content ?? '') : body.content ?? '';
            setSidePreview((current) =>
              current && current.side === side && current.name === spec.skill
                ? { side, name: spec.skill, status: 'ready', content }
                : current,
            );
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setSidePreview((current) =>
              current && current.side === side && current.name === spec.skill
                ? { side, name: spec.skill, status: 'error', content: '', error: message }
                : current,
            );
          }
        };

        const runCompare = async (leftSpec, rightSpec) => {
          const left = leftSpec || compare.left;
          const right = rightSpec || compare.right;
          if (!left.skill || !right.skill) {
            setCompare((current) => Object.assign({}, current, { error: t('comparePick') }));
            return;
          }
          setCompare((current) => Object.assign({}, current, { busy: true, error: null, result: null }));
          setAppliedNotice(null);
          try {
            const body = await api('/compare', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                left: { name: left.skill, catalogId: left.catalogId || undefined, label: left.label || undefined },
                right: { name: right.skill, catalogId: right.catalogId || undefined, label: right.label || undefined },
                task: compare.task,
                lang: uiLang(),
              }),
            });
            setCompare((current) => Object.assign({}, current, { busy: false, result: body }));
          } catch (error) {
            setCompare((current) =>
              Object.assign({}, current, {
                busy: false,
                error: error instanceof Error ? error.message : String(error),
              }),
            );
          }
        };

        const improveNow = async () => {
          if (!compare.left.skill) {
            setCompare((current) => Object.assign({}, current, { error: t('comparePick') }));
            return;
          }
          setUpgrading(true);
          setCompare((current) => Object.assign({}, current, { error: null, result: null }));
          try {
            const improved = await api('/improve', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({
                name: compare.left.skill,
                label: compare.left.label || undefined,
                catalogId: compare.left.catalogId || undefined,
                task: compare.task,
                instruction: compare.improvement,
              }),
            });
            setCompare((current) =>
              Object.assign({}, current, {
                right: {
                  category: current.left.category,
                  skill: improved.skill,
                  catalogId: current.left.catalogId || '',
                  label: improved.label,
                },
              }),
            );
            await loadCompareVersions('right', improved.skill);
            setNotice({ kind: 'ok', text: `${t('improvedSaved')}: ${improved.label}` });
            await runCompare(compare.left, { skill: improved.skill, label: improved.label });
          } catch (error) {
            setCompare((current) =>
              Object.assign({}, current, {
                error: error instanceof Error ? error.message : String(error),
              }),
            );
          } finally {
            setUpgrading(false);
          }
        };

        const chooseVariant = async (side) => {
          if (!compare.result) return;
          const pick = compare.result[side];
          if (compare.result.left.name === compare.result.right.name && pick.label) {
            try {
              await api('/versions/apply', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ skill: pick.name, label: pick.label }),
              });
              // The applied version becomes the left side, so "Improve" can run
              // again from it without reselecting anything.
              setCompare((current) =>
                Object.assign({}, current, {
                  left: {
                    category: current.right.category,
                    skill: pick.name,
                    catalogId: '',
                    label: pick.label,
                  },
                  error: null,
                }),
              );
              await loadCompareVersions('left', pick.name);
              setAppliedNotice({ side, kind: 'ok', text: `${t('versionApplied')}: ${pick.label}` });
              await refresh();
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              setNotice({ kind: 'error', text: message });
              setAppliedNotice({ side, kind: 'error', text: message });
            }
            return;
          }
          const otherName = side === 'left' ? compare.result.right.name : compare.result.left.name;
          const pickSkill = data ? data.skills.find((skill) => skill.name === pick.name) : null;
          const otherSkill = data ? data.skills.find((skill) => skill.name === otherName) : null;
          if (!window.confirm(`${t('chooseAndDisable')} (${otherName})?`)) return;
          try {
            if (pickSkill && pickSkill.writable) {
              await api('/skills', {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name: pick.name, enabled: true }),
              });
            }
            if (otherSkill && otherSkill.writable) {
              await api('/skills', {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ name: otherName, enabled: false }),
              });
              setNotice({ kind: 'ok', text: `${t('chosen')}: ${pick.name} · ${otherName} — off` });
              setAppliedNotice({ side, kind: 'ok', text: `${t('chosen')}: ${pick.name}` });
            } else {
              setNotice({ kind: 'error', text: t('otherReadOnly') });
              setAppliedNotice({ side, kind: 'error', text: t('otherReadOnly') });
            }
            await refresh();
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setNotice({ kind: 'error', text: message });
            setAppliedNotice({ side, kind: 'error', text: message });
          }
        };

        const createCategory = async (title) => {
          const cwd = pathDraft.trim();
          const created = await api(`/categories${cwd ? `?cwd=${encodeURIComponent(cwd)}` : ''}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ title }),
          });
          await loadSkills(pathDraft.trim() || undefined);
          return created.id;
        };

        const openCategoryPrompt = () => {
          if (!editor) return;
          setEditor((current) => (current ? Object.assign({}, current, { error: null }) : current));
          setCategoryDraft('');
        };

        const submitCategory = async () => {
          const title = typeof categoryDraft === 'string' ? categoryDraft.trim() : '';
          if (title === '') return;
          try {
            const id = await createCategory(title);
            setEditor((current) => (current ? Object.assign({}, current, { category: id }) : current));
            setCategoryDraft(null);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setEditor((current) => (current ? Object.assign({}, current, { error: message }) : current));
          }
        };

        const suggestEditorCategory = async () => {
          if (!editor) return;
          try {
            const cwd = pathDraft.trim();
            const suggestion = await api(`/suggest-category${cwd ? `?cwd=${encodeURIComponent(cwd)}` : ''}`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ name: editor.name, description: editor.description, content: editor.content, lang: uiLang() }),
            });
            if (suggestion.categoryId) {
              setEditor((current) => (current ? Object.assign({}, current, { category: suggestion.categoryId }) : current));
              return;
            }
            if (suggestion.newTitle) {
              // Confirm through the inline row instead of window.confirm so the
              // suggestion stays editable and never depends on Electron dialogs.
              setCategoryDraft(suggestion.newTitle);
            }
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setEditor((current) => (current ? Object.assign({}, current, { error: message }) : current));
          }
        };

        const runGrouping = async () => {
          if (groupTask.trim() === '') return;
          setGrouping(true);
          try {
            const body = await api('/group', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ task: groupTask.trim(), lang: uiLang() }),
            });
            setGroups(Array.isArray(body.groups) ? body.groups : []);
          } catch (error) {
            setNotice({ kind: 'error', text: error instanceof Error ? error.message : String(error) });
          } finally {
            setGrouping(false);
          }
        };

        const renderArchive = () => {
          const entries = archiveState.entries || [];
          const categories = data && data.categories ? data.categories : [];
          const groups = new Map();
          for (const entry of entries) {
            const key = entry.category || '';
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push(entry);
          }
          return h(
            'div',
            null,
            h(
              'div',
              { style: styles.toolbar },
              h('div', { style: styles.note }, t('archiveHint')),
              h(
                'button',
                {
                  style: Object.assign({}, styles.button, styles.danger),
                  disabled: entries.length === 0,
                  onClick: emptyArchived,
                },
                t('emptyArchive'),
              ),
            ),
            archiveState.status === 'error'
              ? h('div', { style: styles.error }, archiveState.message)
              : entries.length === 0
                ? h('div', { style: styles.empty }, h('div', { style: styles.emptyTitle }, t('archiveEmpty')))
                : Array.from(groups.entries()).map(([category, list]) =>
                    h(
                      'div',
                      { key: category || 'none' },
                      h(
                        'div',
                        { style: styles.sectionTitle },
                        category ? categoryLabel(t, category, categories) : t('noCategory'),
                      ),
                      h(
                        'div',
                        { style: styles.list },
                        list.map((entry) =>
                          h(
                            'div',
                            { key: entry.id, style: styles.row },
                            h(
                              'div',
                              { style: styles.rowMain },
                              h('div', { style: styles.name }, entry.name),
                              h(
                                'div',
                                { style: styles.description },
                                `${entry.archivedAt ? new Date(entry.archivedAt).toLocaleString() : ''}${
                                  entry.source ? ` · ${sourceLabel(t, entry.source)}` : ''
                                }`,
                              ),
                            ),
                            h(
                              'div',
                              { style: styles.rowSide },
                              h(
                                'button',
                                {
                                  style: Object.assign({}, styles.button, styles.small),
                                  disabled: busy === entry.id,
                                  onClick: () => restoreArchived(entry),
                                },
                                t('restore'),
                              ),
                              h(
                                'button',
                                {
                                  style: Object.assign({}, styles.button, styles.small, styles.danger),
                                  disabled: busy === entry.id,
                                  onClick: () => deleteArchivedForever(entry),
                                },
                                t('deleteForever'),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
          );
        };

        const renderCompare = () => {
          const skills = data ? data.skills : [];
          const categories = data && data.categories ? data.categories : [];
          const catalogEntries = catalog && Array.isArray(catalog.skills) ? catalog.skills : [];
          const installedNames = new Set(skills.map((skill) => skill.name));
          // Both sides offer installed skills and catalog entries, so a skill can
          // be compared before it is installed. Catalog rows carry their id.
          const compareItems = skills
            .map((skill) => ({
              key: skill.name,
              name: skill.name,
              category: skill.category || '',
              catalogId: '',
              label: skill.name,
            }))
            .concat(
              catalogEntries
                .filter((entry) => !installedNames.has(entry.name))
                .map((entry) => ({
                  key: `catalog:${entry.id}`,
                  name: entry.name,
                  category: entry.category || '',
                  catalogId: entry.id,
                  label: `${catalogText(entry).title} · ${t('tabCatalog')}`,
                })),
            );
          const sideCard = (side, title) => {
            const sideState = compare[side];
            const sideVersions = compare.versions[side] || [];
            const sideCategories = categoriesWithSkills(compareItems, categories);
            const activeCategory = sideCategories.some((category) => category.id === sideState.category)
              ? sideState.category
              : '';
            const visibleItems = compareItems.filter(
              (item) => !activeCategory || item.category === activeCategory,
            );
            const selectedKey = sideState.catalogId ? `catalog:${sideState.catalogId}` : sideState.skill;
            return h(
              'div',
              { style: Object.assign({}, styles.form, { flex: '1 1 320px', marginTop: 0 }) },
              h('div', { style: styles.name }, title),
              h(
                'select',
                {
                  style: Object.assign({}, styles.select, { width: '100%', marginTop: 8 }),
                  value: activeCategory,
                  onChange: (event) =>
                    setCompareSide(side, { category: event.target.value, skill: '', catalogId: '', label: '' }),
                },
                h('option', { value: '' }, t('allCategories')),
                sideCategories.map((category) =>
                  h(
                    'option',
                    { key: category.id, value: category.id },
                    categoryLabel(t, category.id, categories),
                  ),
                ),
              ),
              h(
                'select',
                {
                  style: Object.assign({}, styles.select, { width: '100%', marginTop: 8 }),
                  value: selectedKey,
                  onChange: (event) => {
                    const picked = visibleItems.find((item) => item.key === event.target.value);
                    setCompareSide(side, {
                      skill: picked ? picked.name : '',
                      catalogId: picked ? picked.catalogId : '',
                      label: '',
                    });
                  },
                },
                h('option', { value: '' }, visibleItems.length === 0 ? t('nothingFound') : '—'),
                visibleItems.map((item) => h('option', { key: item.key, value: item.key }, item.label)),
              ),
              h(
                'select',
                {
                  style: Object.assign({}, styles.select, { width: '100%', marginTop: 8 }),
                  value: sideState.label,
                  disabled: Boolean(sideState.catalogId) && sideVersions.length === 0,
                  onChange: (event) => setCompareSide(side, { label: event.target.value }),
                },
                h('option', { value: '' }, t('currentVersion')),
                sideVersions.length === 0
                  ? null
                  : sideVersions.map((version) => h('option', { key: version.label, value: version.label }, version.label)),
              ),
            );
          };

          const result = compare.result;
          const column = (side) => {
            if (!result) return null;
            const item = result[side];
            const verdict = side === 'left' ? result.verdict.left : result.verdict.right;
            return h(
              'div',
              { style: Object.assign({}, styles.form, { flex: '1 1 320px', marginTop: 0, minWidth: 0 }) },
              h('div', { style: styles.name }, `${item.name}${item.label ? ' / ' + item.label : ''}`),
              h(
                'pre',
                {
                  style: Object.assign({}, styles.textarea, {
                    whiteSpace: 'pre-wrap',
                    maxHeight: 240,
                    minHeight: 0,
                    overflow: 'auto',
                  }),
                },
                item.body,
              ),
              h('div', { style: Object.assign({}, styles.description, { whiteSpace: 'pre-wrap' }) }, verdict),
              h(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' } },
                h(
                  'button',
                  {
                    style: Object.assign({}, styles.button, styles.small, styles.primary),
                    onClick: () => chooseVariant(side),
                  },
                  side === 'left' ? t('chooseLeft') : t('chooseRight'),
                ),
                appliedNotice && appliedNotice.side === side
                  ? h(
                      'span',
                      {
                        style: Object.assign({}, styles.note, {
                          marginTop: 0,
                          color:
                            appliedNotice.kind === 'error'
                              ? 'var(--dsw-alias-state-error-primary)'
                              : 'var(--dsw-alias-state-success-primary)',
                        }),
                      },
                      appliedNotice.text,
                    )
                  : null,
              ),
            );
          };

          return h(
            'div',
            null,
            h(
              'div',
              { style: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 } },
              sideCard('left', 'A'),
              sideCard('right', 'B'),
            ),
            !compare.result && sidePreview
              ? h(
                  'div',
                  { style: styles.form },
                  h(
                    'div',
                    {
                      style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      },
                    },
                    h('div', { style: styles.name }, `${t('preview')}: ${sidePreview.name}`),
                    h(
                      'div',
                      { style: { display: 'flex', gap: 8 } },
                      sidePreview.status === 'ready'
                        ? h(
                            'button',
                            {
                              style: Object.assign({}, styles.button, styles.small),
                              onClick: () => copyText(sidePreview.content, sidePreview.name),
                            },
                            t('copy'),
                          )
                        : null,
                      (() => {
                        const installed = data ? data.skills.find((skill) => skill.name === sidePreview.name) : null;
                        return installed && installed.writable
                          ? h(
                              'button',
                              {
                                style: Object.assign({}, styles.button, styles.small),
                                onClick: () => openEdit(installed),
                              },
                              t('edit'),
                            )
                          : null;
                      })(),
                    ),
                  ),
                  sidePreview.status === 'loading'
                    ? h('div', { style: styles.note }, t('loading'))
                    : sidePreview.status === 'error'
                      ? h('div', { style: styles.error }, sidePreview.error)
                      : h('pre', { style: styles.pre }, sidePreview.content),
                )
              : null,
            h('div', { style: styles.note }, t('compareCatalogHint')),
            h(
              'label',
              { style: styles.field },
              h('span', { style: styles.fieldLabel }, t('compareTask')),
              h('textarea', {
                style: Object.assign({}, styles.textarea, { minHeight: 70, fontFamily: 'inherit' }),
                value: compare.task,
                placeholder: t('compareTaskPlaceholder'),
                onChange: (event) => setCompare((current) => Object.assign({}, current, { task: event.target.value })),
              }),
            ),
            h(
              'label',
              { style: styles.field },
              h('span', { style: styles.fieldLabel }, t('improveWhat')),
              h('textarea', {
                style: Object.assign({}, styles.textarea, { minHeight: 70, fontFamily: 'inherit' }),
                value: compare.improvement,
                placeholder: t('improveWhatPlaceholder'),
                onChange: (event) =>
                  setCompare((current) => Object.assign({}, current, { improvement: event.target.value })),
              }),
            ),
            compare.error ? h('div', { style: styles.error }, compare.error) : null,
            h(
              'div',
              { style: { marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' } },
              h(
                'button',
                {
                  style: Object.assign({}, styles.button, styles.primary),
                  disabled: compare.busy || upgrading,
                  onClick: () => runCompare(),
                },
                compare.busy ? t('comparing') : t('runCompare'),
              ),
              h(
                'button',
                {
                  style: styles.button,
                  disabled: compare.busy || upgrading,
                  onClick: improveNow,
                },
                upgrading ? t('improving') : t('improve'),
              ),
            ),
            result
              ? h(
                  'div',
                  null,
                  h(
                    'div',
                    { style: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 18 } },
                    column('left'),
                    column('right'),
                  ),
                  result.left.body === result.right.body
                    ? h('div', { style: styles.note }, t('sameText'))
                    : h(
                        'div',
                        null,
                        h('div', { style: styles.sectionTitle }, t('diffTitle')),
                        h(
                          'pre',
                          {
                            style: Object.assign({}, styles.textarea, {
                              maxHeight: 360,
                              overflow: 'auto',
                              minHeight: 0,
                              fontSize: 12,
                            }),
                          },
                          diffLines(result.left.body, result.right.body).map((line, index) =>
                            h(
                              'div',
                              {
                                key: index,
                                style: {
                                  color:
                                    line.type === 'remove'
                                      ? 'var(--dsw-alias-state-error-primary)'
                                      : line.type === 'add'
                                        ? 'var(--dsw-alias-state-success-primary)'
                                        : 'var(--dsw-alias-label-secondary)',
                                },
                              },
                              line.type === 'limit'
                                ? t('diffTooBig')
                                : `${line.type === 'remove' ? '-' : line.type === 'add' ? '+' : ' '} ${line.text}`,
                            ),
                          ),
                        ),
                      ),
                  h(
                    'div',
                    { style: styles.note },
                    `${t('verdictWinner')}: ${result.verdict.winner === 'tie' ? '—' : result.verdict.winner === 'left' ? 'A' : 'B'}`,
                  ),
                )
              : null,
          );
        };

        const renderEditor = () =>
          h(
            'div',
            { style: styles.form, ref: editorRef },
            h(
              'div',
              { style: styles.name },
              editor.mode === 'create' ? t('newSkill') : `${t('edit')}: ${editor.name}`,
            ),
            h(
              'div',
              { style: styles.formRow },
              editor.mode === 'create'
                ? h(
                    'label',
                    { style: Object.assign({}, styles.field, { flex: '0 0 160px' }) },
                    h('span', { style: styles.fieldLabel }, t('scope')),
                    h(
                      'select',
                      {
                        style: Object.assign({}, styles.select, { width: '100%' }),
                        value: editor.scope,
                        onChange: (event) => setEditor({ ...editor, scope: event.target.value }),
                      },
                      h('option', { value: 'project' }, t('scopeProject')),
                      h('option', { value: 'user' }, t('scopeUser')),
                    ),
                  )
                : null,
              editor.mode === 'create'
                ? h(
                    'label',
                    { style: Object.assign({}, styles.field, { flex: '1 1 240px' }) },
                    h('span', { style: styles.fieldLabel }, t('name')),
                    h('input', {
                      style: Object.assign({}, styles.input, { width: '100%' }),
                      value: editor.name,
                      placeholder: 'my-skill',
                      spellCheck: false,
                      onChange: (event) => setEditor({ ...editor, name: event.target.value }),
                    }),
                  )
                : null,
            ),
            editor.mode === 'create' && editor.scope === 'project' && workspaces.length > 0
              ? h(
                  'label',
                  { style: styles.field },
                  h('span', { style: styles.fieldLabel }, t('workspace')),
                  h(
                    'select',
                    {
                      style: Object.assign({}, styles.select, { width: '100%' }),
                      value: editor.workspace || pathDraft,
                      onChange: (event) => setEditor({ ...editor, workspace: event.target.value }),
                    },
                    workspaces.map((workspace) =>
                      h('option', { key: workspace.path, value: workspace.path }, workspace.title),
                    ),
                  ),
                )
              : null,
            editor.mode === 'create'
              ? h(
                  'div',
                  { style: styles.note },
                  editor.scope === 'user'
                    ? t('scopeUserHint')
                    : `${t('scopeProjectHint')}: ${editor.workspace || pathDraft}`,
                )
              : null,
            h(
              'label',
              { style: styles.field },
              h('span', { style: styles.fieldLabel }, t('category')),
              h(
                'select',
                {
                  style: Object.assign({}, styles.select, { width: '100%' }),
                  value: editor.category,
                  onChange: (event) => setEditor({ ...editor, category: event.target.value }),
                },
                h('option', { value: '' }, t('noCategory')),
                (data && data.categories ? data.categories : []).map((category) =>
                  h(
                    'option',
                    { key: category.id, value: category.id },
                    categoryLabel(t, category.id, data ? data.categories : []),
                  ),
                ),
              ),
            ),
            h(
              'div',
              { style: { display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' } },
              h(
                'button',
                { style: Object.assign({}, styles.button, styles.small), onClick: openCategoryPrompt },
                `+ ${t('newCategory')}`,
              ),
              h(
                'button',
                { style: Object.assign({}, styles.button, styles.small), onClick: suggestEditorCategory },
                t('suggestCategory'),
              ),
            ),
            categoryDraft !== null
              ? h(
                  'div',
                  { style: { display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' } },
                  h('input', {
                    style: Object.assign({}, styles.input, { flex: '1 1 200px', minWidth: 160 }),
                    value: categoryDraft,
                    placeholder: t('newCategoryPrompt'),
                    autoFocus: true,
                    spellCheck: false,
                    onChange: (event) => setCategoryDraft(event.target.value),
                    onKeyDown: (event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        submitCategory();
                      } else if (event.key === 'Escape') {
                        setCategoryDraft(null);
                      }
                    },
                  }),
                  h(
                    'button',
                    {
                      style: Object.assign({}, styles.button, styles.small, styles.primary),
                      disabled: categoryDraft.trim() === '',
                      onClick: submitCategory,
                    },
                    t('createCategoryConfirm'),
                  ),
                  h(
                    'button',
                    { style: Object.assign({}, styles.button, styles.small), onClick: () => setCategoryDraft(null) },
                    t('cancel'),
                  ),
                )
              : null,
            h(
              'label',
              { style: styles.field },
              h('span', { style: styles.fieldLabel }, t('description')),
              h('input', {
                style: Object.assign({}, styles.input, { width: '100%' }),
                value: editor.description,
                placeholder: t('descriptionPlaceholder'),
                maxLength: 200,
                onChange: (event) => setEditor({ ...editor, description: event.target.value }),
              }),
            ),
            h(
              'label',
              { style: styles.field },
              h('span', { style: styles.fieldLabel }, t('whenToUse')),
              h('input', {
                style: Object.assign({}, styles.input, { width: '100%' }),
                value: editor.whenToUse,
                maxLength: 120,
                onChange: (event) => setEditor({ ...editor, whenToUse: event.target.value }),
              }),
            ),
            h(
              'div',
              { style: styles.field },
              h('span', { style: styles.fieldLabel }, t('content')),
              h('textarea', {
                style: Object.assign({}, styles.textarea, { minHeight: '42vh' }),
                value: editor.content,
                onChange: (event) => setEditor({ ...editor, content: event.target.value }),
              }),
            ),
            editor.error ? h('div', { style: styles.error }, editor.error) : null,
            h(
              'div',
              { style: styles.formActions },
              editor.mode === 'edit'
                ? h(
                    'button',
                    {
                      style: Object.assign({}, styles.button, styles.small, styles.danger),
                      disabled: editor.busy || busy === editor.name,
                      onClick: async () => {
                        const archived = await removeSkill({ name: editor.name });
                        if (archived) setEditor(null);
                      },
                    },
                    t('delete'),
                  )
                : null,
              h(
                'button',
                {
                  style: Object.assign({}, styles.button, styles.small),
                  onClick: () => {
                    setCategoryDraft(null);
                    setEditor(null);
                  },
                },
                t('cancel'),
              ),
              h(
                'button',
                {
                  style: Object.assign({}, styles.button, styles.small, styles.primary),
                  disabled: editor.busy,
                  onClick: submitEditor,
                },
                editor.busy ? t('saving') : editor.mode === 'create' ? t('create') : t('save'),
              ),
            ),
          );

        const renderVersions = () => {
          if (!versions) return null;
          const rows = versions.list.map((version) =>
            h(
              'div',
              {
                key: version.label,
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '8px 10px',
                  border: '1px solid var(--dsw-alias-border-l1)',
                  borderRadius: 8,
                },
              },
              h(
                'div',
                null,
                h('div', { style: styles.name }, version.label),
                h('div', { style: styles.note }, new Date(version.savedAt).toLocaleString()),
              ),
              h(
                'div',
                { style: { display: 'flex', gap: 6 } },
                h(
                  'button',
                  { style: Object.assign({}, styles.button, styles.small), onClick: () => applyVersionNow(version.label) },
                  t('apply'),
                ),
                h(
                  'button',
                  { style: Object.assign({}, styles.button, styles.small, styles.danger), onClick: () => removeVersionNow(version.label) },
                  t('delete'),
                ),
              ),
            ),
          );
          return h(
            'div',
            { style: styles.form, ref: versionsRef },
            h(
              'div',
              { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 } },
              h('div', { style: styles.name }, `${t('versions')}: ${versions.skill}`),
              h(
                'div',
                { style: { display: 'flex', gap: 8 } },
                (versions.list || []).length > 1
                  ? h(
                      'button',
                      {
                        style: Object.assign({}, styles.button, styles.small, styles.danger),
                        onClick: pruneVersionsNow,
                      },
                      t('pruneVersions'),
                    )
                  : null,
                h(
                  'button',
                  { style: Object.assign({}, styles.button, styles.small), onClick: () => setVersions(null) },
                  t('close'),
                ),
              ),
            ),
            h(
              'div',
              { style: Object.assign({}, styles.formRow, { marginTop: 10 }) },
              h('input', {
                style: Object.assign({}, styles.input, { flex: '1 1 200px' }),
                value: versions.label,
                placeholder: t('versionLabel'),
                spellCheck: false,
                onChange: (event) => setVersions(Object.assign({}, versions, { label: event.target.value })),
              }),
              h('button', { style: Object.assign({}, styles.button, styles.small), onClick: saveVersionNow }, t('saveVersion')),
            ),
            versions.error ? h('div', { style: styles.error }, versions.error) : null,
            versions.status === 'loading' ? h('div', { style: styles.note }, t('loading')) : null,
            versions.status === 'ready' && rows.length === 0 ? h('div', { style: styles.note }, t('noVersions')) : null,
            h('div', { style: styles.list }, rows),
          );
        };

        const renderInstalled = () => {
          if (skillsState.status === 'loading') return h('div', { style: styles.note }, t('loading'));
          if (skillsState.status === 'error') {
            return h(
              'div',
              { style: styles.error },
              h('div', null, `${t('error')}: ${skillsState.message}`),
              h(
                'button',
                { style: Object.assign({}, styles.button, { marginTop: 10 }), onClick: () => loadSkills(pathDraft.trim() || undefined) },
                t('retry'),
              ),
            );
          }
          if (!data || data.skills.length === 0) {
            return h(
              'div',
              { style: styles.empty },
              h('div', { style: styles.emptyTitle }, t('empty')),
              h('div', { style: styles.emptyHint }, t('emptyHint')),
            );
          }
          const budget = data.totalWeight + (data.catalogOverhead || 0);
          const term = skillSearch.trim().toLowerCase();
          // Disabled skills are managed from the catalog, so the installed list
          // shows only the ones the model currently sees.
          const installedRows = data.skills.filter((skill) => skill.modelInvocable !== false);
          const hiddenRows = data.skills.length - installedRows.length;
          const filterCategories = categoriesWithSkills(installedRows, data.categories);
          const activeFilter = filterCategories.some((category) => category.id === skillCategory)
            ? skillCategory
            : '';
          const visible = installedRows.filter((skill) => {
            const byCategory = !activeFilter || skill.category === activeFilter;
            const byName =
              term === '' ||
              skill.name.toLowerCase().includes(term) ||
              (skill.description || '').toLowerCase().includes(term);
            return byCategory && byName;
          });

          const renderGrouped = () => {
            const byName = new Map(installedRows.map((skill) => [skill.name, skill]));
            const used = new Set();
            const sections = groups
              .map((group) => {
                const items = group.skills.map((name) => byName.get(name)).filter(Boolean);
                for (const item of items) used.add(item.name);
                return { title: group.title, items };
              })
              .filter((section) => section.items.length > 0);
            const rest = installedRows.filter((skill) => !used.has(skill.name));
            if (rest.length > 0) sections.push({ title: t('groupOthers'), items: rest });
            return h(
              'div',
              null,
              sections.map((section) =>
                h(
                  'div',
                  { key: section.title },
                  h('div', { style: styles.sectionTitle }, section.title),
                  h(
                    'div',
                    { style: styles.list },
                    section.items.map((skill) =>
                      h(
                        'div',
                        { key: skill.name, style: styles.row },
                        h(
                          'div',
                          { style: styles.rowMain },
                          h('div', { style: styles.name }, skill.name),
                          h('div', { style: styles.description }, skill.description),
                        ),
                        h(
                          'div',
                          { style: styles.rowSide },
                          skill.category
                            ? h('span', { style: styles.badge }, categoryLabel(t, skill.category, data.categories))
                            : null,
                          h('span', { style: Object.assign({}, styles.badge, styles.mono) }, `~${skill.weight} tok`),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            );
          };
          return h(
            'div',
            null,
            h(
              'div',
              { style: Object.assign({}, styles.toolbar, { marginTop: 12 }) },
              h('input', {
                style: Object.assign({}, styles.input, { flex: '1 1 180px' }),
                value: skillSearch,
                placeholder: t('searchPlaceholder'),
                spellCheck: false,
                onChange: (event) => setSkillSearch(event.target.value),
              }),
              h(
                'select',
                {
                  style: styles.select,
                  value: activeFilter,
                  onChange: (event) => setSkillCategory(event.target.value),
                },
                h('option', { value: '' }, t('allCategories')),
                filterCategories.map((category) =>
                  h(
                    'option',
                    { key: category.id, value: category.id },
                    categoryLabel(t, category.id, data.categories),
                  ),
                ),
              ),
            ),
            h(
              'div',
              { style: Object.assign({}, styles.toolbar, { marginTop: 8 }) },
              h('input', {
                style: Object.assign({}, styles.input, { flex: '1 1 200px' }),
                value: groupTask,
                placeholder: t('groupTaskPlaceholder'),
                spellCheck: false,
                onChange: (event) => setGroupTask(event.target.value),
              }),
              h(
                'button',
                { style: styles.button, disabled: grouping, onClick: runGrouping },
                grouping ? t('grouping') : t('groupRun'),
              ),
              groups
                ? h('button', { style: styles.button, onClick: () => setGroups(null) }, t('groupReset'))
                : null,
            ),
            h(
              'div',
              { style: styles.summary },
              h('span', { style: styles.chip }, `${installedRows.length} ${t('skills')}`),
              hiddenRows > 0
                ? h('span', { style: styles.chip }, `${t('hiddenSkills')}: ${hiddenRows}`)
                : null,
              h('span', { style: styles.chip }, `~${budget} ${t('tokens')}`),
              data.complete === false ? h('span', { style: Object.assign({}, styles.chip, styles.warn) }, t('incomplete')) : null,
            ),
            budget > 1200
              ? h(
                  'div',
                  { style: styles.noticeError },
                  `${t('budgetOver')}: ~${budget} ${t('tokens')}. ${t('budgetHint')}`,
                )
              : null,
            groups && groups.length > 0 ? renderGrouped() : null,
            groups && groups.length > 0
              ? null
              : visible.length === 0
                ? h(
                    'div',
                    { style: styles.note },
                    installedRows.length === 0 ? t('allDisabled') : t('nothingFound'),
                  )
                : null,
            h(
              'div',
              {
                style: Object.assign(
                  {},
                  styles.list,
                  groups && groups.length > 0 ? { display: 'none' } : null,
                ),
              },
              visible.map((skill) =>
                h(
                  'div',
                  { key: skill.name, style: styles.row },
                  h(
                    'div',
                    { style: styles.rowMain },
                    h('div', { style: styles.name }, skill.name),
                    h('div', { style: styles.description }, skill.description),
                    skill.writable
                      ? h(
                          'div',
                          { style: styles.actions },
                          h(
                            'button',
                            {
                              style: Object.assign({}, styles.button, styles.small),
                              disabled: busy === skill.name,
                              onClick: () => openVersions(skill),
                            },
                            t('versions'),
                          ),
                          h(
                            'button',
                            {
                              style: Object.assign({}, styles.button, styles.small),
                              disabled: busy === skill.name,
                              onClick: () => openEdit(skill),
                            },
                            t('edit'),
                          ),
                        )
                      : null,
                  ),
                  h(
                    'div',
                    { style: styles.rowSide },
                    h('span', { style: styles.badge }, sourceLabel(t, skill.source)),
                    skill.category
                      ? h('span', { style: styles.badge }, categoryLabel(t, skill.category, data.categories))
                      : null,
                    skill.modelInvocable
                      ? h('span', { style: styles.badge }, t('modelOn'))
                      : h('span', { style: Object.assign({}, styles.badge, styles.warn) }, t('modelOff')),
                    skill.writable ? null : h('span', { style: styles.badge }, t('readOnly')),
                    h('span', { style: Object.assign({}, styles.badge, styles.mono) }, `~${skill.weight} tok`),
                  ),
                ),
              ),
            ),
            h('div', { style: styles.note }, t('estimate')),
          );
        };

        const copyText = async (value, label) => {
          try {
            await navigator.clipboard.writeText(String(value ?? ''));
            setNotice({ kind: 'ok', text: `${t('copied')}: ${label}` });
          } catch {
            setNotice({ kind: 'error', text: t('copyFailed') });
          }
        };

        const renderPreview = () => {
          if (!preview) return null;
          const entry = preview.entry;
          const text = catalogText(entry);
          const installed = Boolean(entry.installed);
          const installedSkill = data ? data.skills.find((skill) => skill.name === entry.name) : null;
          return h(
            'div',
            {
              style: styles.modalBackdrop,
              role: 'presentation',
              onClick: (event) => {
                if (event.target === event.currentTarget) setPreview(null);
              },
            },
            h(
              'div',
              { style: styles.modal, role: 'dialog', 'aria-modal': 'true', 'aria-label': text.title },
              h(
                'div',
                { style: styles.modalHeader },
                h('div', { style: styles.name }, text.title),
                h(
                  'div',
                  { style: styles.modalMeta },
                  `${entry.name} · ${t('previewSource')}: ${entry.source.repo}/${entry.source.path}`,
                ),
                h('div', { style: styles.description }, text.description),
              ),
              h(
                'div',
                { style: styles.modalBody },
                preview.status === 'loading'
                  ? h('div', { style: styles.note }, t('loading'))
                  : preview.status === 'error'
                    ? h('div', { style: styles.error }, preview.error)
                    : h('pre', { style: styles.pre }, preview.content),
              ),
              h(
                'div',
                { style: styles.formActions },
                preview.status === 'ready'
                  ? h(
                      'button',
                      {
                        style: Object.assign({}, styles.button, styles.small),
                        onClick: () => copyText(preview.content, text.title),
                      },
                      t('copy'),
                    )
                  : null,
                installedSkill && installedSkill.writable
                  ? h(
                      'button',
                      {
                        style: Object.assign({}, styles.button, styles.small),
                        onClick: () => {
                          setPreview(null);
                          openEdit(installedSkill);
                        },
                      },
                      t('edit'),
                    )
                  : null,
                h('button', { style: styles.button, onClick: () => setPreview(null) }, t('close')),
                preview.status === 'ready'
                  ? h(
                      'button',
                      {
                        style: Object.assign({}, styles.button, styles.primary),
                        disabled: installed || busy === entry.id,
                        onClick: () => {
                          setPreview(null);
                          install([entry.id]);
                        },
                      },
                      installed ? t('installedBadge') : t('install'),
                    )
                  : null,
              ),
            ),
          );
        };

        const renderCatalog = () => {
          if (catalogState.status === 'loading' || catalogState.status === 'idle') {
            return h('div', { style: styles.note }, t('catalogLoading'));
          }
          if (catalogState.status === 'error') {
            return h(
              'div',
              { style: styles.error },
              h('div', null, `${t('error')}: ${catalogState.message}`),
              h(
                'button',
                { style: Object.assign({}, styles.button, { marginTop: 10 }), onClick: () => loadCatalog(pathDraft.trim() || undefined) },
                t('retry'),
              ),
            );
          }
          if (!catalog || catalog.skills.length === 0) return h('div', { style: styles.note }, t('catalogEmpty'));

          // Hand-made and imported skills have no catalog entry, so the catalog
          // owns their management too: without this section they could not be
          // disabled or removed anywhere.
          const catalogNames = new Set(catalog.skills.map((entry) => entry.name));
          const ownSkills = (data ? data.skills : []).filter(
            (skill) => skill.writable && !catalogNames.has(skill.name),
          );
          const otherWorkspaces = workspaceSkills.filter(
            (workspace) => workspace.path !== pathDraft && workspace.skills.length > 0,
          );

          return h(
            'div',
            null,
            h(
              'div',
              { style: styles.toolbar },
              h('span', { style: styles.note }, t('installScope')),
              h(
                'select',
                {
                  style: styles.select,
                  value: installScope,
                  onChange: (event) => setInstallScope(event.target.value),
                },
                h('option', { value: 'project' }, t('scopeProject')),
                h('option', { value: 'user' }, t('scopeUser')),
              ),
            ),
            h('div', { style: styles.note }, t('catalogCreatedHint')),
            ownSkills.length > 0
              ? h(
                  'div',
                  null,
                  h('div', { style: styles.sectionTitle }, `${t('catMine')} · ${ownSkills.length}`),
                  h(
                    'div',
                    { style: styles.list },
                    ownSkills.map((skill) =>
                      h(
                        'div',
                        { key: skill.name, style: styles.row },
                        h(
                          'div',
                          { style: styles.rowMain },
                          h('div', { style: styles.name }, skill.name),
                          h('div', { style: styles.description }, skill.description),
                        ),
                        h(
                          'div',
                          { style: styles.rowSide },
                          h('span', { style: styles.badge }, sourceLabel(t, skill.source)),
                          h(
                            'button',
                            {
                              style: Object.assign({}, styles.button, styles.small),
                              disabled: busy === skill.name,
                              onClick: () => toggleSkill(skill),
                            },
                            skill.modelInvocable ? t('disable') : t('enable'),
                          ),
                          h(
                            'button',
                            {
                              style: Object.assign({}, styles.button, styles.small),
                              disabled: busy === skill.name,
                              onClick: () => openEdit(skill),
                            },
                            t('edit'),
                          ),
                          h(
                            'button',
                            {
                              style: Object.assign({}, styles.button, styles.small, styles.danger),
                              disabled: busy === skill.name,
                              onClick: () => removeSkill(skill),
                            },
                            t('delete'),
                          ),
                        ),
                      ),
                    ),
                  ),
                )
              : null,
            otherWorkspaces.length > 0
              ? h(
                  'div',
                  null,
                  h(
                    'div',
                    {
                      style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 8,
                      },
                    },
                    h('div', { style: styles.sectionTitle }, t('otherWorkspaces')),
                    h(
                      'button',
                      {
                        style: Object.assign({}, styles.button, styles.small),
                        disabled: busy === 'collect',
                        onClick: collectAll,
                      },
                      t('collectAll'),
                    ),
                  ),
                  otherWorkspaces.map((workspace) =>
                    h(
                      'div',
                      { key: workspace.path, style: styles.form },
                      h(
                        'div',
                        {
                          style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 8,
                            alignItems: 'center',
                          },
                        },
                        h(
                          'div',
                          { style: { minWidth: 0 } },
                          h('div', { style: styles.name }, workspace.title),
                          h('div', { style: Object.assign({}, styles.note, styles.mono) }, workspace.path),
                        ),
                        h(
                          'button',
                          {
                            style: Object.assign({}, styles.button, styles.small),
                            onClick: () => openWorkspace(workspace),
                          },
                          t('openWorkspace'),
                        ),
                      ),
                      h(
                        'div',
                        { style: styles.list },
                        workspace.skills.map((skill) =>
                          h(
                            'div',
                            { key: skill.name, style: styles.row },
                            h(
                              'div',
                              { style: styles.rowMain },
                              h('div', { style: styles.name }, skill.name),
                              h('div', { style: styles.description }, skill.description),
                            ),
                            h(
                              'div',
                              { style: styles.rowSide },
                              skill.enabled
                                ? null
                                : h('span', { style: Object.assign({}, styles.badge, styles.warn) }, t('modelOff')),
                              h(
                                'button',
                                {
                                  style: Object.assign({}, styles.button, styles.small, styles.primary),
                                  disabled: busy === `copy:${skill.name}`,
                                  onClick: () => copyHere(workspace, skill),
                                },
                                t('copyHere'),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                )
              : null,
            catalog.categories.map((category) => {
              const entries = catalog.skills.filter((entry) => entry.category === category.id);
              const missing = entries.filter((entry) => !entry.installed);
              const heading = catalogText(category).title;
              return h(
                'div',
                { key: category.id },
                h(
                  'div',
                  { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 } },
                  h('div', { style: styles.sectionTitle }, `${heading} · ${entries.length}`),
                  missing.length > 0
                    ? h(
                        'button',
                        {
                          style: Object.assign({}, styles.button, styles.small),
                          disabled: busy === missing.map((entry) => entry.id).join(','),
                          onClick: () => {
                            const delta = missing.reduce(
                              (sum, entry) =>
                                sum + Math.ceil((entry.name.length + catalogText(entry).description.length) / 4),
                              0,
                            );
                            if (!window.confirm(`${t('installAll')}: ${missing.length} · ~+${delta} ${t('tokens')}`)) return;
                            install(missing.map((entry) => entry.id));
                          },
                        },
                        t('installAll'),
                      )
                    : null,
                ),
                h(
                  'div',
                  { style: styles.list },
                  entries.map((entry) => {
                    const text = catalogText(entry);
                    // An installed catalog entry is manageable right here: the
                    // row keeps preview + install, and adds disable/delete for
                    // the installed copy when it is writable.
                    const installedSkill = data ? data.skills.find((skill) => skill.name === entry.name) : null;
                    return h(
                      'div',
                      { key: entry.id, style: styles.row },
                      h(
                        'div',
                        {
                          style: Object.assign({}, styles.rowMain, styles.rowClickable),
                          role: 'button',
                          tabIndex: 0,
                          onClick: () => openPreview(entry),
                          onKeyDown: (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              openPreview(entry);
                            }
                          },
                        },
                        h('div', { style: styles.name }, text.title),
                        h('div', { style: styles.description }, text.description),
                        h('div', { style: Object.assign({}, styles.note, styles.mono) }, entry.name),
                      ),
                      h(
                        'div',
                        { style: styles.rowSide },
                        entry.license ? h('span', { style: styles.badge }, entry.license) : null,
                        entry.installed
                          ? h('span', { style: Object.assign({}, styles.badge, styles.ok) }, t('installedBadge'))
                          : h(
                              'button',
                              {
                                style: Object.assign({}, styles.button, styles.small, styles.primary),
                                disabled: busy === entry.id,
                                onClick: () => install([entry.id]),
                              },
                              busy === entry.id ? t('installing') : t('install'),
                            ),
                        installedSkill && installedSkill.writable
                          ? h(
                              'button',
                              {
                                style: Object.assign({}, styles.button, styles.small),
                                disabled: busy === installedSkill.name,
                                onClick: () => toggleSkill(installedSkill),
                              },
                              installedSkill.modelInvocable ? t('disable') : t('enable'),
                            )
                          : null,
                        installedSkill && installedSkill.writable
                          ? h(
                              'button',
                              {
                                style: Object.assign({}, styles.button, styles.small, styles.danger),
                                disabled: busy === installedSkill.name,
                                onClick: () => removeSkill(installedSkill),
                              },
                              t('delete'),
                            )
                          : null,
                      ),
                    );
                  }),
                ),
              );
            }),
          );
        };

        return h(
          'div',
          { style: styles.page },
          h(
            'div',
            { style: styles.inner },
            h(
              'div',
              { style: styles.header },
              h(
                'div',
                null,
                h('h1', { style: styles.title }, t('title')),
                h('p', { style: styles.subtitle }, t('subtitle')),
              ),
              h(
                'button',
                { style: Object.assign({}, styles.button, styles.primary), onClick: openCreate },
                `+ ${t('newSkill')}`,
              ),
            ),
            h(
              'div',
              { style: styles.toolbar },
              h('input', {
                style: styles.input,
                value: pathDraft,
                placeholder: t('pathPlaceholder'),
                spellCheck: false,
                onChange: (event) => setPathDraft(event.target.value),
                onKeyDown: (event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    loadFromPath();
                  }
                },
              }),
              h(
                'button',
                { style: styles.button, disabled: refreshing, onClick: loadFromPath },
                refreshing ? t('loading') : t('load'),
              ),
              h(
                'button',
                { style: styles.button, disabled: pickingFolder, onClick: chooseFolder },
                pickingFolder ? t('loading') : t('chooseFolder'),
              ),
              h(
                'button',
                {
                  style: Object.assign({}, styles.button, styles.primary),
                  disabled: refreshing,
                  onClick: refresh,
                },
                refreshing ? t('loading') : t('refresh'),
              ),
            ),
            recentPaths.length > 0
              ? h(
                  'div',
                  {
                    style: {
                      display: 'flex',
                      gap: 6,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      marginTop: 8,
                    },
                  },
                  h('span', { style: styles.note }, `${t('recentPlaces')}:`),
                  recentPaths.map((path) =>
                    h(
                      'button',
                      {
                        key: path,
                        title: path,
                        disabled: path === pathDraft,
                        style: Object.assign(
                          {},
                          styles.button,
                          styles.small,
                          path === pathDraft ? styles.primary : null,
                        ),
                        onClick: () => switchToPath(path),
                      },
                      shortPath(path),
                    ),
                  ),
                )
              : null,
            h(
              'div',
              { style: styles.tabs },
              h(
                'button',
                {
                  style: Object.assign({}, styles.tab, tab === 'installed' ? styles.tabActive : null),
                  onClick: () => setTab('installed'),
                },
                t('tabInstalled'),
              ),
              h(
                'button',
                {
                  style: Object.assign({}, styles.tab, tab === 'catalog' ? styles.tabActive : null),
                  onClick: () => setTab('catalog'),
                },
                t('tabCatalog'),
              ),
              h(
                'button',
                {
                  style: Object.assign({}, styles.tab, tab === 'compare' ? styles.tabActive : null),
                  onClick: () => setTab('compare'),
                },
                t('tabCompare'),
              ),
              h(
                'button',
                {
                  style: Object.assign({}, styles.tab, tab === 'archive' ? styles.tabActive : null),
                  onClick: () => setTab('archive'),
                },
                t('tabArchive'),
              ),
            ),
            notice
              ? h('div', { style: notice.kind === 'error' ? styles.noticeError : styles.notice }, notice.text)
              : null,
            renderPreview(),
            editor ? renderEditor() : null,
            versions ? renderVersions() : null,
            tab === 'installed'
              ? renderInstalled()
              : tab === 'catalog'
                ? renderCatalog()
                : tab === 'archive'
                  ? renderArchive()
                  : renderCompare(),
          ),
        );
      };
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { ru: RU, zh: ZH, en: EN }), 'create-skills: dictionaries');

        // Rebind the translator on every locale change: `tr` keeps calling the
        // current binding, and the page subscribes below to re-render.
        let bound = ctx.locale.bind(NS);
        ctx.effect(
          () =>
            typeof ctx.locale.subscribe === 'function'
              ? ctx.locale.subscribe(() => {
                  bound = ctx.locale.bind(NS);
                })
              : undefined,
          'create-skills: locale rebind',
        );
        const tr = (key) => bound(key);

        const Page = makePage(tr, ctx);
        function GuardedPage() {
          return h(Boundary, null, h(Page));
        }

        ctx.slots.inject('main', () =>
          ctx.slots.register({ name: 'main', key: 'create-skills', locale: NS }, GuardedPage),
        );
        ctx.slots.inject('sidebar.panellist', () =>
          ctx.slots.register(
            { name: 'sidebar.panellist', id: 'create-skills', order: 30, label: () => tr('title'), locale: NS },
            PanelIcon,
          ),
        );

        // Right-click a Session -> Skills: open this page for that session's
        // workspace. Guarded, because the context-menu service is optional.
        ctx.effect(() => {
          const menus = ctx.get('contextMenus');
          trackEvent('menu-register', menus && typeof menus.register === 'function' ? 'service-ok' : 'service-missing');
          if (!menus || typeof menus.register !== 'function') return undefined;
          return menus.register({
            id: 'session.skills',
            target: 'session',
            order: 520,
            // The item stays visible even when the workspace path is unknown:
            // clicking it then just opens the page.
            resolve: (target) => [
              {
                id: 'skills',
                label: tr('title'),
                run: () => {
                  const path = workspacePathOf(ctx, target);
                  trackEvent(
                    'menu-run',
                    `${target ? Object.keys(target).join(',') : 'no-target'} -> ${path || 'no-path'}`,
                  );
                  openSkillsFor(ctx, path);
                },
              },
            ],
          });
        }, 'create-skills: session menu');
      },
    };
  },
});

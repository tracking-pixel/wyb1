import React, { useState } from 'react';
import { contentService } from '@/src/services/content';
import { useWorkoutStore } from '@/src/store/workoutStore';
import { useTranslation } from '@/src/i18n';

export const MealPlanView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { t } = useTranslation();
  const mealPlan = contentService.getMealPlan();
  const { checkedGroceries, toggleGroceryItem } = useWorkoutStore();

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'menu' | 'grocery'>('menu');

  const currentDay = mealPlan.weekDays[activeDayIndex] || mealPlan.weekDays[0];

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-rose-100">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-rose-800 flex items-center gap-1 hover:underline"
        >
          ← Volver
        </button>
        <span className="font-bold text-sm text-slate-900">
          {t('app.meal_plan.title')}
        </span>
        <div className="w-8" />
      </div>

      {/* Tabs Menu / Grocery */}
      <div className="flex p-1 bg-rose-100/60 rounded-xl">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
            activeTab === 'menu'
              ? 'bg-white text-rose-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('app.meal_plan.week_label')}
        </button>
        <button
          onClick={() => setActiveTab('grocery')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
            activeTab === 'grocery'
              ? 'bg-white text-rose-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {t('app.meal_plan.grocery_list_title')}
        </button>
      </div>

      {activeTab === 'menu' ? (
        <div className="space-y-4">
          {/* Day Selector Ribbon */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {mealPlan.weekDays.map((d: any, idx: number) => {
              const isSelected = activeDayIndex === idx;
              return (
                <button
                  key={d.day}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                    isSelected
                      ? 'bg-rose-800 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200'
                  }`}
                >
                  {d.dayName}
                </button>
              );
            })}
          </div>

          {/* Meals Cards */}
          <div className="space-y-3">
            {/* Breakfast */}
            <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  {t('app.meal_plan.breakfast')} • {currentDay.breakfast.prepTime}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  ~{currentDay.breakfast.caloriesApprox} kcal
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">
                {currentDay.breakfast.title}
              </h4>
              {currentDay.breakfast.ingredients && (
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Ingredientes:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {currentDay.breakfast.ingredients.map((ing: string, i: number) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Lunch */}
            <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full">
                  {t('app.meal_plan.lunch')} • {currentDay.lunch.prepTime}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  ~{currentDay.lunch.caloriesApprox} kcal
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">
                {currentDay.lunch.title}
              </h4>
              {currentDay.lunch.ingredients && (
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Ingredientes:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {currentDay.lunch.ingredients.map((ing: string, i: number) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Snack */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {t('app.meal_plan.snack')}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  ~{currentDay.snack.caloriesApprox} kcal
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">
                {currentDay.snack.title}
              </h4>
            </div>

            {/* Dinner */}
            <div className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {t('app.meal_plan.dinner')} • {currentDay.dinner.prepTime}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  ~{currentDay.dinner.caloriesApprox} kcal
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">
                {currentDay.dinner.title}
              </h4>
              {currentDay.dinner.ingredients && (
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Ingredientes:</p>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {currentDay.dinner.ingredients.map((ing: string, i: number) => (
                      <li key={i}>{ing}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Grocery List with Checkboxes */
        <div className="space-y-4">
          {mealPlan.groceryList.map((cat: any, cIdx: number) => (
            <div
              key={cIdx}
              className="p-4 rounded-2xl bg-white border border-rose-100 shadow-xs space-y-2.5"
            >
              <h4 className="font-bold text-xs uppercase tracking-wider text-rose-950">
                {cat.category}
              </h4>
              <div className="space-y-2">
                {cat.items.map((item: string, iIdx: number) => {
                  const isChecked = checkedGroceries.includes(item);
                  return (
                    <label
                      key={iIdx}
                      className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleGroceryItem(item)}
                        className="rounded text-rose-800 focus:ring-rose-800"
                      />
                      <span className={isChecked ? 'line-through text-slate-400' : ''}>
                        {item}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

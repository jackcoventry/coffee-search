'use client';

import {
  FORM_QUERY_BUTTON,
  FORM_QUERY_ERROR_MAX,
  FORM_QUERY_ERROR_MIN,
  FORM_QUERY_PLACEHOLDER,
  INTRO_TITLE,
} from '@/consts/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useId } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import z from 'zod';
import { Button } from '@/components/Button/Button';
import { Message } from '@/components/Message/Message';
import './QueryForm.css';

z.config({ jitless: true });

const QueryFormSchema = z.object({
  query: z.string().min(2, FORM_QUERY_ERROR_MIN).max(150, FORM_QUERY_ERROR_MAX),
});

export type QueryFormSchemaType = z.infer<typeof QueryFormSchema>;
export type QueryFormResult = {
  query: string;
};

type QueryFormProps = {
  onSubmit: SubmitHandler<QueryFormSchemaType>;
  isLoading: boolean;
};

export function QueryForm({ onSubmit, isLoading }: Readonly<QueryFormProps>) {
  const formId = useId();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<QueryFormSchemaType>({
    resolver: zodResolver(QueryFormSchema),
    defaultValues: {
      query: '',
    },
    mode: 'onSubmit',
  });

  const submitHandler = (data: { query: string }) => {
    if (isLoading) return;
    onSubmit(data);
  };
  const queryId = `${formId}-query`;
  const queryErrorId = `${formId}-query-error`;
  const queryHeadingId = `${formId}-query-heading`;

  return (
    <>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="query-form | grid"
        data-loading={isLoading}
      >
        <div className="query-form__content | p-3 overflow-hidden w-full lg:w-156.25">
          <h1
            className="font-heading"
            id={queryHeadingId}
          >
            {INTRO_TITLE}
          </h1>
          <label
            className="sr-only"
            htmlFor={queryId}
          >
            {INTRO_TITLE}
          </label>
          <div className="flex flex-col gap-6">
            <Controller
              name="query"
              control={control}
              disabled={isLoading}
              render={({ field }) => (
                <input
                  type="text"
                  {...field}
                  placeholder={FORM_QUERY_PLACEHOLDER}
                  data-valid={errors?.query ? 'false' : 'true'}
                  value={field.value}
                  id={queryId}
                  aria-describedby={errors?.query ? queryErrorId : undefined}
                  aria-invalid={errors?.query ? 'true' : 'false'}
                  className={`font-body focusable w-full border-b-2 p-4 outline${errors?.query ? ' outline-red-500' : ''}`}
                />
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="query-form__button | cursor-pointer mx-auto"
              icon="search"
            >
              {FORM_QUERY_BUTTON}
            </Button>
          </div>
        </div>
      </form>

      {errors.query && (
        <Message
          id={queryErrorId}
          type="error"
        >
          {errors.query?.message}
        </Message>
      )}
    </>
  );
}

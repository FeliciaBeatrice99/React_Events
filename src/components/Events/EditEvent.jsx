import { Link, useNavigate, useParams } from 'react-router-dom';

import Modal from '../UI/Modal.jsx';
import EventForm from './EventForm.jsx';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetchEvent, queryClient, updateEvent } from '../../util/http.js';
import LoadingIndicator from '../UI/LoadingIndicator.jsx';

export default function EditEvent() {
  const navigate = useNavigate();
  const params= useParams();
  const id = params.id
  const {data, isPending, isError, error} = useQuery({
    queryKey: ['events', id],
    queryFn: ({signal}) => fetchEvent({id, signal})
  })
  const {mutate} = useMutation({
    mutationFn: updateEvent,
    onMutate: (data) => {
      const newEvent = data.event;
      const prevEvent = queryClient.getQueryData(['events', id])
      queryClient.cancelQueries(['events', id])
      queryClient.setQueryData(['events', id], newEvent )

      return {
        prevEvent
      }
    },
    onError: (error, data, context) => {
      queryClient.setQueryData( ['events', id], context.prevEvent )
    },
    onSettled: () => {
      queryClient.invalidateQueries(['events', id])
    }
  })
  function handleSubmit(formData) {
    mutate({ id, event: formData})
    navigate('../');

  }

  function handleClose() {
    navigate('../');
  }
  let content;

  if (isPending) {
    content = (
      <div className="center">
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event"
          message={
            error.info?.message ||
            'Failed to load event. Please check your inputs and try again later.'
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }
  return (
    <Modal onClose={handleClose}>
      {content}
    </Modal>
  );
}
